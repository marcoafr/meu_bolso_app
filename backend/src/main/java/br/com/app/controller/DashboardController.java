package br.com.app.controller;

import br.com.app.dto.BankAccountResponseDTO;
import br.com.app.dto.BankTransferDTO;
import br.com.app.dto.HeritageEvolutionRequestDTO;
import br.com.app.dto.HeritageEvolutionResponseDTO;
import br.com.app.model.BankAccount;
import br.com.app.model.Receivable;
import br.com.app.model.User;
import br.com.app.model.Transfer;
import br.com.app.repository.BankAccountRepository;
import br.com.app.repository.ReceivableRepository;
import br.com.app.repository.TransferRepository;
import br.com.app.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @Autowired
    private TransferRepository transferRepository;

    @PostMapping("/currentBalance")
    public List<BankAccountResponseDTO> findCurrentBalanceByUserId(@RequestBody Long userId) {
        // Buscar todas as contas bancárias do usuário com status ACTIVE
        List<BankAccount> activeBankAccounts = bankAccountRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Para cada conta bancária, calcular o saldo atual subtraindo os valores pagos das receivables
        return activeBankAccounts.stream().map(account -> {
            // Calcular o total de receivables pagas para esta conta
            BigDecimal totalPaidReceivables = receivableRepository
                .findByBankAccountIdAndStatus(account.getId(), Constants.TransactionStatus.PAID)
                .stream()
                .map(receivable -> {
                    BigDecimal amount = receivable.getPaidAmount();
                    Constants.CategoryType type = receivable.getTransaction().getCategory().getType();
                    return type == Constants.CategoryType.RECEIPT ? amount.negate() : amount; // Subtrai se for RECEIPT, soma se for EXPENSE
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add); // Soma os valores

            BigDecimal totalTransferInReceivables = transferRepository
                .findByBankAccountToId(account.getId())
                .stream()
                .map(Transfer::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalTransferOutReceivables = transferRepository
                .findByBankAccountFromId(account.getId())
                .stream()
                .map(Transfer::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Criar um DTO com o saldo atualizado
            return new BankAccountResponseDTO(
                    account.getId(),
                    account.getName(),
                    account.getColor(),
                    account.getInitialAmount()
                        .subtract(totalPaidReceivables)
                        .subtract(totalTransferOutReceivables)
                        .add(totalTransferInReceivables)
            );
        }).collect(Collectors.toList());
    }

    @PostMapping("/heritageEvolution")
    public List<HeritageEvolutionResponseDTO> findHeritageEvolutionByUserIdAndMonthsAmount(@RequestBody HeritageEvolutionRequestDTO heritageEvolutionRequestDTO) {
        Long userId = heritageEvolutionRequestDTO.getUserId();
        int monthsAmount = heritageEvolutionRequestDTO.getMonthsAmount();

        // Buscar todas as contas bancárias do usuário com status ACTIVE
        List<BankAccount> activeBankAccounts = bankAccountRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Calcular as "fotografias" de saldos em cada período de 15 dias
        Map<LocalDate, List<HeritageEvolutionResponseDTO>> groupedResults = new HashMap<>();
        LocalDate currentDate = LocalDate.now();

        // Gerar os períodos de 15 em 15 dias retrocedendo
        for (int i = 0; i < monthsAmount * 2; i++) { // *2 porque são 2 períodos por mês (15 dias de cada vez)
            LocalDate period = currentDate.minusDays(15 * i);

            // Para cada período, calcular os saldos das contas bancárias
            for (BankAccount account : activeBankAccounts) {
                // Calcular o total de receivables pagas para esta conta no período
                BigDecimal totalPaidReceivables = receivableRepository
                    .findByBankAccountIdAndStatusAndPaymentDateLessThanEqual(account.getId(), Constants.TransactionStatus.PAID, period)
                    .stream()
                    .map(receivable -> {
                        BigDecimal amount = receivable.getPaidAmount();
                        Constants.CategoryType type = receivable.getTransaction().getCategory().getType();
                        return type == Constants.CategoryType.RECEIPT ? amount.negate() : amount; // Subtrai se for RECEIPT, soma se for EXPENSE
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalTransferInReceivables = transferRepository
                    .findByBankAccountToIdAndDateLessThanEqual(account.getId(), period)
                    .stream()
                    .map(Transfer::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalTransferOutReceivables = transferRepository
                    .findByBankAccountFromIdAndDateLessThanEqual(account.getId(), period)
                    .stream()
                    .map(Transfer::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Criar um DTO com o saldo atualizado para esse período
                HeritageEvolutionResponseDTO dto = new HeritageEvolutionResponseDTO(
                        account.getId(),
                        account.getName(),
                        account.getColor(),
                        account.getInitialAmount()
                            .subtract(totalPaidReceivables)
                            .subtract(totalTransferOutReceivables)
                            .add(totalTransferInReceivables),
                        period
                );

                // Agrupar os resultados por período
                groupedResults.computeIfAbsent(period, k -> new ArrayList<>()).add(dto);
            }
        }

        // Agora converter o Map em uma lista de objetos agrupados por período
        List<HeritageEvolutionResponseDTO> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<HeritageEvolutionResponseDTO>> entry : groupedResults.entrySet()) {
            LocalDate period = entry.getKey();
            List<HeritageEvolutionResponseDTO> bankAccountsBalances = entry.getValue();

            // Criar um novo DTO para o período com a lista de saldos das contas
            HeritageEvolutionResponseDTO periodDTO = new HeritageEvolutionResponseDTO(
                    null, // Não é necessário o id da conta aqui, pois estamos agrupando por período
                    null, // Não é necessário o nome da conta aqui, pois estamos agrupando por período
                    null, // Não é necessário a cor da conta aqui, pois estamos agrupando por período
                    null, // Não é necessário o saldo total aqui, pois estamos agrupando por período
                    period
            );
            periodDTO.setBankAccountsBalances(bankAccountsBalances); // A lista de saldos das contas para o período

            result.add(periodDTO); // Adicionar o DTO agrupado à lista final
        }

        return result;
    }

    @PostMapping("/bankTransfer")
    public ResponseEntity<String> bankTransfer(@RequestBody BankTransferDTO bankTransferDTO) {
        // Validação: Verificar se todos os campos obrigatórios estão presentes
        if (bankTransferDTO.getFromBankAccount() == null || bankTransferDTO.getToBankAccount() == null || bankTransferDTO.getAmount() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Todos os campos são obrigatórios.");
        }

        // Validação: Verificar se o fromBank não é igual ao toBank
        if (bankTransferDTO.getFromBankAccount().equals(bankTransferDTO.getToBankAccount())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("O banco de origem não pode ser igual ao banco de destino.");
        }

        // Validação: Verificar se o amount é maior que zero
        if (bankTransferDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("O valor da transferência não pode ser zero ou negativo.");
        }

        // Se todas as validações passarem, você pode continuar com a lógica de transferência
        processTransfer(bankTransferDTO);
        
        return ResponseEntity.status(HttpStatus.OK).body("Transferência realizada com sucesso.");
    }

    // Processar a transferência
    private void processTransfer(BankTransferDTO bankTransferDTO) {
        LocalDate now = LocalDate.now();

        // Criar Transfer com os dados fornecidos
        Transfer transfer = createTransfer(bankTransferDTO, now);

        // Salvar a transferência no repositório
        transferRepository.save(transfer);
    }

    // Criar Receivable com os dados fornecidos
    private Transfer createTransfer(BankTransferDTO bankTransferDTO, LocalDate now) {
        Transfer transfer = new Transfer();
        transfer.setAmount(bankTransferDTO.getAmount());
        transfer.setDate(now);

        // Configurar contas bancárias
        transfer.setBankAccountFrom(new BankAccount());
        transfer.getBankAccountFrom().setId(bankTransferDTO.getFromBankAccount());

        transfer.setBankAccountTo(new BankAccount());
        transfer.getBankAccountTo().setId(bankTransferDTO.getToBankAccount());

        // Configurar usuário
        transfer.setUser(new User());
        transfer.getUser().setId(bankTransferDTO.getUserId());

        // Configurar status inicial
        transfer.setStatus(Constants.Status.ACTIVE);

        return transfer;
    }
}
