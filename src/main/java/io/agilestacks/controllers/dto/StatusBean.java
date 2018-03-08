package io.agilestacks.controllers.dto;

import java.time.Duration;

public class StatusBean {

    private String name;
    private String version;
    private Duration uptime;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Duration getUptime() {
        return uptime;
    }

    public void setUptime(Duration uptime) {
        this.uptime = uptime;
    }

    public StatusBean(String name, String version, Duration uptime) {
        this.name = name;
        this.version = version;
        this.uptime = uptime;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String version;
        private Duration uptime;

        public Builder setName(final String name) {
            this.name = name;
            return this;
        }

        public Builder setVersion(final String version) {
            this.version = version;
            return this;
        }

        public Builder setUptime(final Duration uptime) {
            this.uptime = uptime;
            return this;
        }

        public StatusBean build() {
            return new StatusBean(this.name, this.version, this.uptime);
        }
    }
}
