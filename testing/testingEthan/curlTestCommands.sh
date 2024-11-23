#!/bin/bash

PORT=$1
BASE_URL="http://localhost:$PORT"

# Test /projectFromPlace
curl -G "$BASE_URL/projectFromPlace" --data-urlencode "Name,Address"
curl -G "$BASE_URL/projectFromPlace" --data-urlencode "Name"

# Test /getCuisinesAboveThreshold
curl -G "$BASE_URL/getCuisinesAboveThreshold" --data-urlencode "threshold=2.0"
curl -G "$BASE_URL/getCuisinesAboveThreshold" --data-urlencode "threshold=5.0"

# Test /selectingPlace
curl -G "$BASE_URL/selectingPlace" --data-urlencode "inputString=OpeningTime >= '09:00' AND ClosingTime <= '18:00'"
curl -G "$BASE_URL/selectingPlace" --data-urlencode "name = stanley park"