#!/usr/bin/env groovy

@Library('agilestacks') _

properties([
        parameters([
                string(name: 'APP_NAME', defaultValue: 'chuck', description: 'Name of the app to be used inside kubernetes'),
                string(name: 'APP_URL', defaultValue: "chuck.${env.INGRESS_FQDN}", description: 'External URL where current app shall be accessible'),
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
            stage("Compile") {
                sh script: './gradlew clean build'
                sh script: './gradlew allureReport'
                archiveArtifacts 'build/libs/chnorr-*.jar'
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
            def dockerImage = params.DOCKER_IMAGE
            def commit = commitHash.shortHash()
            def images = [ "$dockerImage:$commit",
                           "$dockerImage:latest"
            ]
            stage('Build') {
                sh script: "docker build --pull --rm ${images.collect{"--tag ${it}"}.join(' ')} ."
            }
            stage('Push') {
                ecr.login()
                def pushImages = images.collectEntries{ [it: { sh script: "docker push ${it}" }]}

                parallel pushImages
            }

            def template = readFile 'deployment.yaml'
            def deployment = render.template template, [
                    app:            params.APP_NAME,
                    namespace:      params.NAMESPACE,
                    replicas:       params.REPLICAS,
                    host:           params.APP_URL,
                    dockerRegistry: params.DOCKER_IMAGE,
                    tag:            commit,
                    version:        '1.0.0'
            ]
            stage('Deploy') {
                writeFile file: "deployment-build-${currentBuild.number}.yaml", text: deployment
                def exists = sh returnStatus: true, script: "kubectl -n ${params.NAMESPACE} get -f deployment-build-${currentBuild.number}.yaml"
                try {
                    if (exists == 0) {
                        sh script: "kubectl -n ${params.NAMESPACE} set image --record deployment/${params.APP_NAME} '${params.APP_NAME}=${params.DOCKER_IMAGE}:$commit'"
                    } else {
                        sh script: "kubectl -n ${params.NAMESPACE} apply --force --record -f deployment-build-${currentBuild.number}.yaml"
                    }
                    sh script: "kubectl -n ${params.NAMESPACE} rollout status -w 'deployment/${params.APP_NAME}'"
                } catch(err) {
                    sh script: """
            kubectl -n ${params.NAMESPACE} rollout undo 'deployment/${params.APP_NAME}'
            kubectl -n ${params.NAMESPACE} rollout status -w 'deployment/${params.APP_NAME}'
          """

                    error message: """
            Failed to deploy ${params.APP_NAME} with container ${params.DOCKER_IMAGE}:$commit \n
            We rolled back unsuccessful deployment
          """
                }
            }
        }
        stage('Validate') {
            retry(20) {
                sleep 1
                def resp = httpRequest url: "http://${params.APP_NAME}.${params.NAMESPACE}.svc.cluster.local"
                echo resp.content
                assert resp.status == 200
            }
        }
    }
}