package io.agilestacks.controllers;

import io.agilestacks.controllers.dto.StatusBean;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

@RestController
public class StatusController {

    @RequestMapping(value={"/", "/status"})
    public StatusBean getStatus() {
        RuntimeMXBean rb = ManagementFactory.getRuntimeMXBean();

        Duration duration = Duration.of(rb.getUptime(), ChronoUnit.MILLIS);

        return StatusBean.builder()
                .setName("test application")
                .setVersion("1.0")
                .setUptime(duration)
                .build();
    }

}
