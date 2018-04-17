#!/usr/bin/env groovy

@Library('agilestacks') _

properties([
        parameters([
                string(name: 'APP_NAME', defaultValue: 'chuck', description: 'Name of the app to be used inside kubernetes'),
                string(name: 'APP_URL', defaultValue: "chuck.${env.INGRESS_FQDN}", description: 'External URL where current app will be accessible'),
                string(name: 'NAMESPACE', defaultValue: 'default', description: 'Namespace where container will be deployed'),
                string(name: 'REPLICAS', defaultValue:  '3', description: 'Number of pod replicas'),
                string(name: 'DOCKER_IMAGE', defaultValue: env.DOCKER_REGISTRY, description: 'Docker registry for applicaiton')
        ]),
        pipelineTriggers([
                [$class: 'GitHubPushTrigger'],
                pollSCM('H/15 * * * *')
        ])
])

node('master') {
    stage('Checkout') {
        checkout scm
    }
}

podTemplate(
        inheritFrom: 'toolbox',
        label: 'kubernetes',
        containers: [
                containerTemplate(
                        name: 'java',
                        image: 'openjdk:jdk',
                        ttyEnabled: true,
                        command: 'cat'
                )],
        volumes: [
                emptyDirVolume(memory: false, mountPath: '/root/.gradle')
        ]
) {
    node('kubernetes') {
        container('java') {
            stage("Test") {
                sh script: './gradlew clean test'
                sh script: './gradlew allureReport'
                junit 'build/test-results/*.xml'
                publishHTML([
                        reportDir: 'build/allure-report',
                        reportFiles: 'index.html',
                        reportName: 'Allure Report',
                        keepAll: true
                ])
            }
        }
        container('toolbox') {
            stage('Compile') {
                sh script: "make compile"
            }
            stage('Deploy') {
                sh script: """
                    hub --aws_region ${env.STATE_REGION} elaborate ./hub-application.yaml \
                        -s s3://${env.STATE_BUCKET}/hub/${env.BASE_DOMAIN}.hub
                    hub deploy ./hub.yaml.elaborate
                """
            }
        }
        stage('Validate') {
            retry(20) {
                sleep 1
                def resp = httpRequest url: "http://${params.APP_URL}.apps.${env.BASE_DOMAIN}"
                echo resp.content
                assert resp.status == 200
            }
        }
    }
}