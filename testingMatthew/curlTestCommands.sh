#!/bin/bash

PORT=${1:-3000}
BASE_URL="http://localhost:$PORT"

# Test /reviews DELETE
curl -X DELETE "$BASE_URL/reviews" -H "Content-Type: application/json" -d '{"reviewID":"123", "userID":"456"}'

# Test /reviews PUT
curl -X PUT "$BASE_URL/reviews" -H "Content-Type: application/json" -d '{"reviewID":"123", "userID":"456", "newMessage":"Updated review message"}'

# Test /highest-average-rating GET
curl -G "$BASE_URL/highest-average-rating"

