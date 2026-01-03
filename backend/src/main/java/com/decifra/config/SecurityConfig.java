import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
      .authorizeHttpRequests(auth -> auth
        .requestMatchers(
          "/swagger-ui/**",
          "/swagger-ui.html",
          "/v3/api-docs/**"
        ).permitAll()
        .anyRequest().authenticated()
      )
      // se sua API é stateless (JWT etc), normalmente desabilita CSRF:
      .csrf(csrf -> csrf.disable())
      .build();
  }
}