# Testing Guide

## Overview
Comprehensive testing guide for backend, frontend, and load testing.

---

## Backend Testing

### Setup Test Environment

```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

### Running Specific Tests

```bash
# Payment tests only
pytest tests/test_payment.py -v

# RFQ flow tests
pytest tests/test_rfq_flow.py -v

# Specific test
pytest tests/test_payment.py::TestStripePayment::test_create_payment_intent_success -v
```

### Test Coverage

View coverage report:
```bash
# Generate HTML report
pytest --cov=app --cov-report=html

# Open in browser
open htmlcov/index.html  # Mac
start htmlcov/index.html  # Windows
```

Target coverage: **>80%**

---

## Frontend Testing

### Setup

```bash
cd frontend

# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Running Specific Tests

```bash
# Payment component tests
npm test Payment.test.tsx

# Watch mode
npm test -- --watch
```

### Component Testing

Test files are located in `frontend/__tests__/`

Example test structure:
```typescript
describe('ComponentName', () => {
  test('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### API Integration Tests

Test complete API workflows:

```bash
# Start test database
docker compose -f docker-compose.test.yml up -d

# Run integration tests
pytest tests/integration/ -v

# Cleanup
docker compose -f docker-compose.test.yml down
```

### End-to-End Testing

Using Playwright (if configured):

```bash
npx playwright test

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

---

## Load Testing

### Install Locust

```bash
pip install locust
```

### Run Load Tests

```bash
# Local API
locust -f backend/tests/load/locustfile.py --host=http://localhost:8000

# Production API (be careful!)
locust -f backend/tests/load/locustfile.py --host=https://api.app.alsakronline.com
```

### Access Locust UI

1. Open browser: `http://localhost:8089`
2. Set number of users: `100`
3. Spawn rate: `10` users/second
4. Click **Start swarming**

### Monitoring During Load Test

```bash
# Monitor CPU/Memory
docker stats

# Monitor logs
docker compose logs -f  backend

# Check response times
# View in Locust UI Charts tab
```

### Performance Targets

- **Avg Response Time**: < 200ms
- **95th Percentile**: < 500ms
- **99th Percentile**: < 1000ms
- **Error Rate**: < 1%
- **Concurrent Users**: 100+

---

## Database Testing

### Test Database Setup

Create test database:
```sql
CREATE DATABASE alsakr_test;
```

Configure in `backend/.env.test`:
```env
DATABASE_URL=postgresql://user:pass@localhost/alsakr_test
```

### Migration Testing

```bash
# Run migrations on test DB
DATABASE_URL=$TEST_DATABASE_URL alembic upgrade head

# Test rollback
DATABASE_URL=$TEST_DATABASE_URL alembic downgrade -1
```

---

## Performance Testing

### Query Performance

Use the optimization utilities:

```python
from app.utils.optimize_queries import get_query_performance_stats

# After running tests
stats = get_query_performance_stats()
print(f"Avg query time: {stats['average_time']}ms")
print(f"Slow queries: {stats['slow_queries']}")
```

### Database Indexes

Apply indexes:
```python
from app.utils.optimize_queries import apply_database_indexes
from app.database import engine

apply_database_indexes(engine)
```

### Caching Tests

Test Redis caching:

```python
from app.utils.caching import cache_set, cache_get

# Set value
cache_set("test_key", {"data": "value"}, ttl=60)

# Get value
result = cache_get("test_key")
assert result == {"data": "value"}
```

---

## Security Testing

### Authentication Tests

```bash
# Test auth endpoints
pytest tests/test_auth.py -v
```

### JWT Token Tests

```python
def test_expired_token():
    # Test with expired token
    response = client.get("/api/protected", headers={
        "Authorization": "Bearer expired_token"
    })
    assert response.status_code == 401
```

### SQL Injection Tests

```python
def test_sql_injection_prevention():
    # Try SQL injection
    response = client.post("/api/login", json={
        "email": "test' OR '1'='1",
        "password": "anything"
    })
    assert response.status_code == 401
```

---

## Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest --cov=app
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Test Data

### Creating Test Data

```python
# In tests/conftest.py
@pytest.fixture
def test_user(db):
    user = User(
        email="test@example.com",
        full_name="Test User",
        role="buyer"
    )
    db.add(user)
    db.commit()
    return user

@pytest.fixture
def test_rfq(db, test_user):
    rfq = RFQ(
        title="Test RFQ",
        buyer_id=test_user.id,
        quantity=10,
        status="open"
    )
    db.add(rfq)
    db.commit()
    return rfq
```

---

## Debugging Tests

### Verbose Output

```bash
pytest -vv --tb=short
```

### Stop on First Failure

```bash
pytest -x
```

### Run Last Failed

```bash
pytest --lf
```

### PDB Debugging

```python
def test_something():
    import pdb; pdb.set_trace()
    # Test code
```

---

## Test Reports

### HTML Report

```bash
pytest --html=report.html --self-contained-html
```

### JUnit XML (for CI)

```bash
pytest --junitxml=junit.xml
```

---

## Best Practices

1. **Write tests first** (TDD approach)
2. **Test one thing** per test function
3. **Use descriptive names** for tests
4. **Mock external services** (Stripe, PayPal)
5. **Clean up test data** after tests
6. **Run tests before commits**
7. **Maintain >80% coverage**
8. **Test edge cases** and error conditions

---

## Troubleshooting

### Tests Failing Locally

```bash
# Clear cache
pytest --cache-clear

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Flaky Tests

- Use `pytest-retry` for flaky tests
- Add `@pytest.mark.flaky(reruns=3)`
- Investigate timing issues

### Database Lock Errors

- Use separate test database
- Implement proper transaction rollback in fixtures

---

## Resources

- [Pytest Documentation](https://docs.pytest.org)
- [Testing Library](https://testing-library.com)
- [Locust Documentation](https://docs.locust.io)
