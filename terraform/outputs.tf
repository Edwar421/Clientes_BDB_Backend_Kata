output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.postgres.address
  sensitive   = true
}

output "lambda_customers_function_name" {
  description = "Customers Lambda function name"
  value       = aws_lambda_function.customers.function_name
}
