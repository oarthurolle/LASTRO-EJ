package br.com.lastro.email.sender;

import br.com.lastro.email.model.TransactionalEmail;

public interface EmailSender {
    void send(TransactionalEmail email);
}
