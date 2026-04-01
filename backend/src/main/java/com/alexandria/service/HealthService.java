package com.alexandria.service;

import com.alexandria.dto.HealthResponseDto;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    public HealthResponseDto getHealthStatus() {
        return new HealthResponseDto(
            "ok",
            "Backend do Alexandria funcionando."
        );
    }
}
