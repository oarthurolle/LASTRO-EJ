package br.com.lastro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class LastroApplication {

	public static void main(String[] args) {
		SpringApplication.run(LastroApplication.class, args);
	}

}
