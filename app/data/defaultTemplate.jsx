

export const defaultTemplate = {
    subject: 'Your Cart is waiting for you!',
    logo: '/logo.png',
    content: (
        <div>
            <h1>Hey there!</h1>
            <p>Looks like you left some items in your cart. Don't worry, we've saved them for you.</p>
            <a href="/cart">Go to cart</a>
            <img src="/cart-image.jpg" alt="Cart items" />
        </div>
    )
}