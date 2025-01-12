package br.com.app.repository;

import br.com.app.dto.ReceivablesRequest;
import br.com.app.model.Receivable;
import java.util.List;

public interface ReceivableRepositoryCustom {
    List<Receivable> searchReceivables(ReceivablesRequest request);
}
