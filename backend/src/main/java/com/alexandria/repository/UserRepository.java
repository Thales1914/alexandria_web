package com.alexandria.repository;

import com.alexandria.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
}
