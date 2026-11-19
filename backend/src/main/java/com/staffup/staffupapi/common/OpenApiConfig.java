package com.staffup.staffupapi.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI staffupOpenApi() {
        return new OpenAPI().info(new Info()
                .title("StaffUp API")
                .description("API de staffing de consultants pour ESN")
                .version("0.1.0"));
    }
}