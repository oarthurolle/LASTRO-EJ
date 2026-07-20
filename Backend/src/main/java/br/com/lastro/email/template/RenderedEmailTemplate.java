package br.com.lastro.email.template;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RenderedEmailTemplate {
    String subject;
    String htmlBody;
    String textBody;
}
