package com.alexandria.service;

import com.alexandria.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.alexandria.model.User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));

        return User.withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .disabled(!user.isEnabled())
                .build();
    }
}
