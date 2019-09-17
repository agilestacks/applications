BUCKET_NAME ?= default
BUCKET_ACL ?= private

aws := aws --endpoint=$(ENDPOINT)

# for minio we rely only on AWS_ACCESS_KEY_ID and AWS_SECRET_KEY_ID
unexport AWS_PROFILE
unexport AWS_DEFAULT_PROFILE

test-connect:
	@ echo "Checking connectivity to: $(ENDPOINT)"
	$(aws) s3 ls

deploy: test-connect
	$(aws) s3api head-bucket --bucket=$(BUCKET_NAME) || \
		$(aws) s3api create-bucket \
			--bucket=$(BUCKET_NAME) \
			--acl=$(BUCKET_ACL)

undeploy:
	- $(aws) s3api delete-bucket --bucket=$(BUCKET)
