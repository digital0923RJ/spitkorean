from quart import Blueprint, request, current_app
import stripe
import hmac
import hashlib
from app.utils.response import api_response, error_response
from app.models.subscription import Subscription
from app.models.user import User

webhooks = Blueprint('webhooks', __name__, url_prefix='/api/v1/webhooks')

@webhooks.route('/stripe', methods=['POST'])
async def stripe_webhook():
    """Stripe webhook handler"""
    try:
        payload = await request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        # Verify Stripe signature
        endpoint_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            return error_response("Invalid payload", 400)
        except stripe.error.SignatureVerificationError:
            return error_response("Invalid signature", 400)
        
        # Process Stripe events
        if event['type'] == 'checkout.session.completed':
            await handle_successful_payment(event['data']['object'])
        
        elif event['type'] == 'invoice.payment_succeeded':
            await handle_subscription_renewal(event['data']['object'])
        
        elif event['type'] == 'customer.subscription.deleted':
            await handle_subscription_cancelled(event['data']['object'])
        
        elif event['type'] == 'invoice.payment_failed':
            await handle_payment_failed(event['data']['object'])
        
        return api_response({"received": True}, "Webhook processed")
        
    except Exception as e:
        current_app.logger.error(f"Webhook error: {str(e)}")
        return error_response("Webhook processing failed", 500)

async def handle_successful_payment(session):
    """Process successful payment"""
    user_id = session.get('client_reference_id')
    subscription_id = session.get('subscription')
    
    if user_id and subscription_id:
        db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]
        
        # Activate user's subscription
        await Subscription.activate_subscription(db, user_id, subscription_id)
        
        # Update user's subscription status
        await User.update_subscription_status(db, user_id, "active")

async def handle_subscription_renewal(invoice):
    """Process subscription renewal"""
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')

    if not customer_id or not subscription_id:
        return
    
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]

    # Update subscription status to "active" and log renewal date
    await Subscription.renew_subscription(db, customer_id, subscription_id)

    # Update user's subscription status
    await User.update_subscription_status(db, customer_id, "active")

async def handle_subscription_cancelled(subscription):
    """Process subscription cancellation"""
    customer_id = subscription.get('customer')
    subscription_id = subscription.get('id')

    if not customer_id or not subscription_id:
        return
    
    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]

    # Mark subscription as canceled or inactive in the database
    await Subscription.cancel_subscription(db, customer_id, subscription_id)

    # Update user's subscription status to "canceled" or "inactive"
    await User.update_subscription_status(db, customer_id, "canceled")

async def handle_payment_failed(invoice):
    """Process failed payment"""
    customer_id = invoice.get('customer')

    if not customer_id:
        return

    db = current_app.mongo_client[current_app.config.get("MONGO_DB_USERS")]

    # Record the failure to notify the user or retry charging later
    await Subscription.mark_payment_failed(db, customer_id)

    # Update user's subscription status to "past_due" or other status you use
    await User.update_subscription_status(db, customer_id, "past_due")
