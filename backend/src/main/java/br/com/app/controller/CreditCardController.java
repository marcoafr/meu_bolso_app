package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.CreditCardDTO;
import br.com.app.repository.CreditCardRepository;
import br.com.app.model.CreditCard;
import br.com.app.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/credit-cards")
public class CreditCardController {

    @Autowired
    private CreditCardRepository creditCardRepository;

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
}
