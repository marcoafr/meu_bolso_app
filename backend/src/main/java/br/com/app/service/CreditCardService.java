package br.com.app.service;

import br.com.app.model.CreditCard;
import br.com.app.repository.CreditCardRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;

    @Autowired
    public CreditCardService(CreditCardRepository creditCardRepository) {
        this.creditCardRepository = creditCardRepository;
    }    

    /**
    * Busca um cartão pelo ID.
    *
    * @param cardId ID do cartão a ser buscada.
    * @return Categoria encontrada ou null se não for encontrada.
    */
    public CreditCard getCreditCardById(Long cardId) {
        Optional<CreditCard> card = creditCardRepository.findById(cardId);
        return card.orElse(null);
    }
}
