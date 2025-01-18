package br.com.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.app.dto.ReceivableByCategoryDTO;
import br.com.app.dto.ReceivableFilterDTO;
import br.com.app.repository.ReceivableRepository;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

@Service
public class ReceivableService {

    @Autowired
    private ReceivableRepository receivableRepository;

    @Transactional
    public List<ReceivableByCategoryDTO> getReceivablesByMonth(ReceivableFilterDTO filter) {
        // Convertendo o mês e ano para LocalDate
        int month = Integer.parseInt(filter.getMonth());
        int year = Integer.parseInt(filter.getYear());
        
        // Data de início (1º do mês)
        LocalDate startDate = LocalDate.of(year, month, 1);
        
        // Data de fim (último dia do mês)
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // Chama o repositório para buscar e agrupar os dados
        return receivableRepository.findReceivablesByMonthAndUser(startDate, endDate, filter.getUserId());
    }
}

