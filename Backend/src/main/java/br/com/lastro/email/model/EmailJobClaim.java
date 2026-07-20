package br.com.lastro.email.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EmailJobClaim {
    EmailJob job;
    String claimToken;
}
