package br.com.lastro.email.template;

import br.com.lastro.email.model.EmailType;

import java.util.Map;

public interface EmailTemplateRenderer {
    RenderedEmailTemplate render(EmailType emailType, Map<String, Object> model);
}
