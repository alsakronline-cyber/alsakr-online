/**
 * Payment Component Tests
 * Tests for Stripe and PayPal payment components
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentProvider } from '@/context/PaymentContext';
import { CheckoutPayment } from '@/components/checkout/CheckoutPayment';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import { PayPalButton } from '@/components/payment/PayPalButton';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(() => Promise.resolve({
        confirmPayment: jest.fn()
    }))
}));

// Mock PayPal
jest.mock('@paypal/react-paypal-js', () => ({
    PayPalScriptProvider: ({ children }: any) => <div>{children}</div>,
    PayPalButtons: ({ createOrder, onApprove }: any) => (
        <button
            onClick={async () => {
                const orderId = await createOrder();
                await onApprove({ orderID: orderId });
            }}
        >
            PayPal
        </button>
    )
}));

describe('CheckoutPayment Component', () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders payment method selection', () => {
        render(
            <PaymentProvider>
                <CheckoutPayment
                    orderId="test-order-123"
                    amount={100.00}
                    onSuccess={mockOnSuccess}
                    onError={mockOnError}
                />
            </PaymentProvider>
        );

        expect(screen.getByText('Select Payment Method')).toBeInTheDocument();
        expect(screen.getByText('Credit Card')).toBeInTheDocument();
        expect(screen.getByText('PayPal')).toBeInTheDocument();
    });

    test('switches between payment providers', async () => {
        const user = userEvent.setup();

        render(
            <PaymentProvider>
                <CheckoutPayment
                    orderId="test-order-123"
                    amount={100.00}
                    onSuccess={mockOnSuccess}
                    onError={mockOnError}
                />
            </PaymentProvider>
        );

        const paypalButton = screen.getByText('PayPal');
        await user.click(paypalButton);

        // Verify PayPal button is rendered
        expect(screen.getByText(/PayPal/)).toBeInTheDocument();
    });

    test('displays order total correctly', () => {
        render(
            <PaymentProvider>
                <CheckoutPayment
                    orderId="test-order-123"
                    amount={123.45}
                    onSuccess={mockOnSuccess}
                    onError={mockOnError}
                />
            </PaymentProvider>
        );

        expect(screen.getByText('$123.45')).toBeInTheDocument();
    });
});

describe('Payment Processing', () => {
    test('handles successful Stripe payment', async () => {
        const mockOnSuccess = jest.fn();

        // Mock successful payment creation
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    client_secret: 'test_secret',
                    payment_intent_id: 'pi_test123'
                })
            })
        ) as jest.Mock;

        render(
            <PaymentProvider>
                <StripePaymentForm
                    orderId="test-order-123"
                    amount={100.00}
                    onSuccess={mockOnSuccess}
                    onError={jest.fn()}
                />
            </PaymentProvider>
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    test('handles failed payment', async () => {
        const mockOnError = jest.fn();

        // Mock failed payment creation
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    detail: 'Payment failed'
                })
            })
        ) as jest.Mock;

        render(
            <PaymentProvider>
                <StripePaymentForm
                    orderId="test-order-123"
                    amount={100.00}
                    onSuccess={jest.fn()}
                    onError={mockOnError}
                />
            </PaymentProvider>
        );

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalled();
        });
    });
});

describe('PayPal Integration', () => {
    test('creates PayPal order on button click', async () => {
        const user = userEvent.setup();
        const mockOnSuccess = jest.fn();

        // Mock PayPal order creation
        global.fetch = jest.fn((url) => {
            if (url.includes('paypal/create-order')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        paypal_order_id: 'PAYPAL123',
                        approval_url: 'https://paypal.com/approve'
                    })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        }) as jest.Mock;

        render(
            <PaymentProvider>
                <PayPalButton
                    orderId="test-order-123"
                    amount={100.00}
                    onSuccess={mockOnSuccess}
                    onError={jest.fn()}
                />
            </PaymentProvider>
        );

        const paypalButton = screen.getByText('PayPal');
        await user.click(paypalButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('paypal/create-order'),
                expect.any(Object)
            );
        });
    });
});
