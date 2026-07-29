package br.com.lastro;

import br.com.lastro.repository.BlogPostRepository;
import br.com.lastro.repository.PartnerRepository;
import br.com.lastro.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LastroApplicationTests extends AbstractTestcontainersTest {

	@Autowired
	private UserRepository userRepository;
	@Autowired
	private BlogPostRepository blogPostRepository;
	@Autowired
	private PartnerRepository partnerRepository;
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Test
	void cleanStartupShouldCreateOnlyGeneralDirector() {
		assertEquals(1, userRepository.count());
		assertEquals(1, userRepository.findByRole("DIRECTOR").size());
		var director = userRepository.findByRole("DIRECTOR").iterator().next();
		assertEquals("bootstrap-test@lastro.test", director.getEmail());
		assertTrue(passwordEncoder.matches("senha-bootstrap-123", director.getPassword()));
		assertEquals(0, blogPostRepository.count());
		assertEquals(0, partnerRepository.count());
	}

}
