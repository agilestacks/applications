#!/usr/bin/env groovy

@Library('agilestacks') _

properties([
        parameters([
                string(name: 'APP_NAME', defaultValue: 'chuck', description: 'Name of the app to be used inside kubernetes'),
                string(name: 'APP_URL', defaultValue: "chuck.${env.INGRESS_FQDN}", description: 'External URL where current app will be accessible'),
                string(name: 'NAMESPACE', defaultValue: 'default', description: 'Namespace where container will be deployed'),
                string(name: 'REPLICAS', defaultValue:  '3', description: 'Number of pod replicas'),
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
        def gradleProps
        container('java') {
            stage("Compile") {
                gradleProps = sh(script: './gradlew properties -q', returnStdout: true)
                    .collect { it.split(':') }
                    .collectEntries { [(it[0].trim()):it[1].trim()] }

                sh script: './gradlew clean build'
                sh script: './gradlew allureReport'
                archiveArtifacts "build/libs/*.jar"
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
            def outputs
            stage('Prepare dependencies') {
                def log = sh(script: """
                    hub --aws_region ${env.STATE_REGION} elaborate ./hub-application.yaml \
                        -s s3://${env.STATE_BUCKET}/hub/${env.BASE_DOMAIN}.hub
                    hub deploy ./hub.yaml.elaborate
                """, returnStdout: true)

                outputs = parseHubOutputs(log)
            }

            def dockerImage = outputs['java-application:component.ecr.image']
            def commit = commitHash.shortHash()
            def images = [ "$dockerImage:$commit", "$dockerImage:latest" ]

            stage('Build') {
                sh script: """
                    docker build --pull \
                         --rm \
                         --build-arg APP_NAME=${gradleProps['archivesBaseName']} \
                         --build-arg APP_VERSION=${gradleProps['version']} \
                         ${images.collect{"--tag ${it}"}.join(' ')} .
                """
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
                    image:          "$dockerImage:$commit",
                    version:        gradleProps['version']
            ]
            stage('Deploy') {
                sh script: "hub --aws_region ${env.STATE_REGION} kubeconfig s3://${env.STATE_BUCKET}/hub/${env.BASE_DOMAIN}.hub"

                writeFile file: "deployment-build-${currentBuild.number}.yaml", text: deployment
                def exists = sh returnStatus: true, script: "kubectl -n ${params.NAMESPACE} get -f deployment-build-${currentBuild.number}.yaml"
                try {
                    if (exists == 0) {
                        sh script: "kubectl -n ${params.NAMESPACE} set image --record deployment/${params.APP_NAME} '${params.APP_NAME}=${dockerImage}:$commit'"
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
            Failed to deploy ${params.APP_NAME} with container $dockerImage:$commit \n
            We rolled back unsuccessful deployment
          """
                }
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