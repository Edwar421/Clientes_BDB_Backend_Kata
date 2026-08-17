# Common environment variables for Lambda function
locals {
  lambda_env_vars = {
    DB_HOST     = aws_db_instance.postgres.address
    DB_PORT     = tostring(aws_db_instance.postgres.port)
    DB_NAME     = var.db_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
    DB_SSL      = "true"
    NODE_ENV    = "production"

    SENDGRID_API_KEY    = var.sendgrid_api_key
    SENDGRID_FROM_EMAIL = var.sendgrid_from_email
    SENDGRID_FROM_NAME  = var.sendgrid_from_name
    SENDGRID_REPLY_TO   = var.sendgrid_reply_to
  }
}

# Lambda Function - Customers API
resource "aws_lambda_function" "customers" {
  filename         = "../dist/customers.zip"
  function_name    = "${local.name_prefix}-api"
  role             = aws_iam_role.lambda_role.arn
  handler          = "handler.handler"
  source_code_hash = filebase64sha256("../dist/customers.zip")
  runtime          = var.lambda_runtime
  timeout          = 30
  memory_size      = 512

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = local.lambda_env_vars
  }

  tags = {
    Name = "${local.name_prefix}-api"
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_vpc_execution,
    aws_iam_role_policy_attachment.lambda_basic_execution
  ]
}

# CloudWatch Log Group for Customers Lambda
resource "aws_cloudwatch_log_group" "customers" {
  name              = "/aws/lambda/${aws_lambda_function.customers.function_name}"
  retention_in_days = 7
}

# Lambda Permission for API Gateway - Customers
resource "aws_lambda_permission" "api_gateway_customers" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.customers.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
