package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.CategoryDTO;
import br.com.app.dto.CreditCardDTO;
import br.com.app.dto.CreditCardSummarizedInfoFilter;
import br.com.app.dto.ReceivableDTO;
import br.com.app.dto.TransactionDTO;
import br.com.app.repository.CreditCardRepository;
import br.com.app.repository.ReceivableRepository;
import br.com.app.model.Category;
import br.com.app.model.CreditCard;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;
import br.com.app.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/credit-cards")
public class CreditCardController {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    // Endpoint de pesquisa de contas bancárias por userId
    @PostMapping("/search")
    public List<CreditCardDTO> findByUserId(@RequestBody Long userId) {
        List<CreditCard> creditCards = creditCardRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Convertendo de CreditCard para CreditCardDTO
        return creditCards.stream()
                .map(creditCard -> new CreditCardDTO(
                        creditCard.getId(),
                        null,
                        creditCard.getName(),
                        creditCard.getColor(),
                        creditCard.getClosingDay(),
                        creditCard.getPayingDay(),
                        creditCard.getStatus().getValue()))
                .collect(Collectors.toList());
    }

    // Endpoint para adicionar um novo cartão de crédito
    @PostMapping("/add")
    public CreditCardDTO addCreditCard(@RequestBody CreditCardDTO creditCardDTO) {
        CreditCard creditCard = new CreditCard();
        creditCard.setUser(new User());
        creditCard.getUser().setId(creditCardDTO.getUserId());
        creditCard.setName(creditCardDTO.getName());
        creditCard.setColor(creditCardDTO.getColor());
        creditCard.setClosingDay(creditCardDTO.getClosingDay());
        creditCard.setPayingDay(creditCardDTO.getPayingDay());
        creditCard.setStatus(Constants.Status.ACTIVE);

        CreditCard savedCreditCard = creditCardRepository.save(creditCard);

        return new CreditCardDTO(
                savedCreditCard.getId(),
                null,
                savedCreditCard.getName(),
                savedCreditCard.getColor(),
                savedCreditCard.getClosingDay(),
                savedCreditCard.getPayingDay(),
                savedCreditCard.getStatus().getValue());
    }

    // Endpoint para editar um cartão de crédito existente
    @PostMapping("/edit")
    public CreditCardDTO editCreditCard(@RequestBody CreditCardDTO creditCardDTO) {
        CreditCard creditCard = creditCardRepository.findById(creditCardDTO.getId())
                .orElseThrow(() -> new RuntimeException("Cartão de crédito não encontrado"));

        creditCard.setName(creditCardDTO.getName());
        creditCard.setColor(creditCardDTO.getColor());
        creditCard.setClosingDay(creditCardDTO.getClosingDay());
        creditCard.setPayingDay(creditCardDTO.getPayingDay());
        if (creditCardDTO.getStatus() != null) {
                creditCard.setStatus(creditCardDTO.getStatus() == 0 ?
                        Constants.Status.ACTIVE : Constants.Status.INACTIVE
                );
        }

        CreditCard updatedCreditCard = creditCardRepository.save(creditCard);

        return new CreditCardDTO(
                updatedCreditCard.getId(),
                null,
                updatedCreditCard.getName(),
                updatedCreditCard.getColor(),
                updatedCreditCard.getClosingDay(),
                updatedCreditCard.getPayingDay(),
                updatedCreditCard.getStatus().getValue());
    }

    @PostMapping("/summarized-info")
    public List<ReceivableDTO> getSummarizedInfo(@RequestBody CreditCardSummarizedInfoFilter filter) {
        // Buscar o cartão de crédito pelo ID
        CreditCard creditCard = creditCardRepository.findById(filter.getCreditCardId())
                .orElseThrow(() -> new RuntimeException("Cartão de crédito não encontrado"));

        // Calcular as datas de início e fim do intervalo
        LocalDate startDate = LocalDate.of(filter.getYear(), filter.getMonth(), creditCard.getClosingDay() + 1).minusMonths(1);
        LocalDate endDate = LocalDate.of(filter.getYear(), filter.getMonth(), creditCard.getClosingDay());

        // Buscar os receivables pelo intervalo de datas
        List<Receivable> receivables = receivableRepository.findByCardCompetenceDateBetweenAndCreditCardAndUserId(
                startDate, 
                endDate,
                filter.getUserId(),
                filter.getCreditCardId()
                );
    
        // Converter para DTO
        return receivables.stream()
            .map(receivable -> {
                // Obter Transaction e Category associados
                Transaction transaction = receivable.getTransaction();
                Category category = transaction.getCategory();

                // Mapear Category para DTO
                CategoryDTO categoryDTO = new CategoryDTO(
                        category.getId(),
                        null,
                        category.getName(),
                        category.getType().getValue(),
                        category.getStatus().getValue()
                );

                // Mapear Transaction para DTO
                TransactionDTO transactionDTO = new TransactionDTO(
                        transaction.getId(),
                        transaction.getTotalAmount(),
                        transaction.getIssueDate(),
                        transaction.getStatus().getValue(),
                        null,
                        null,
                        transaction.getDescription(),
                        null, // Receivables será gerenciado separadamente, para evitar loop infinito
                        null,
                        transaction.getCreditCard().getId(),
                        transaction.getCreditCard().getName(),
                        categoryDTO
                );

                // Mapear Receivable para DTO
                return new ReceivableDTO(
                        receivable.getId(),
                        receivable.getTotalAmount(),
                        receivable.getCompetenceDate(),
                        receivable.getCardCompetenceDate(),
                        receivable.getStatus().getValue(),
                        receivable.getBankAccount() != null ? receivable.getBankAccount().getId() : null,
                        receivable.getBankAccount() != null ? receivable.getBankAccount().getName() : null,
                        transactionDTO,
                        receivable.getMetadata() // Incluído o novo campo metadata
                );
            })
            .collect(Collectors.toList());
    }

}
