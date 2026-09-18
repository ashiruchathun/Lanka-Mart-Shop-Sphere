package com.lankamartshopsphere.service;

import com.lankamartshopsphere.model.CartItem;
import com.lankamartshopsphere.model.Customer;
import com.lankamartshopsphere.model.Product;
import com.lankamartshopsphere.repository.CartRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    // Add an electronic product to the cart
    public void addToCart(
            Customer customer,
            Product product,
            int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        Optional<CartItem> existingItem =
                cartRepository.findByCustomerAndProduct(
                        customer,
                        product
                );

        if (existingItem.isPresent()) {

            // Product already exists in the cart
            CartItem item = existingItem.get();

            item.setQuantity(item.getQuantity() + quantity);

            cartRepository.save(item);

        } else {

            // Create a new cart item
            CartItem newItem = new CartItem();

            newItem.setCustomer(customer);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);

            cartRepository.save(newItem);
        }
    }

    // Get all cart items belonging to a customer
    public List<CartItem> getCartItems(Customer customer) {
        return cartRepository.findByCustomer(customer);
    }

    // Remove one cart item
    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartRepository.deleteById(cartItemId);
    }

    // Calculate the total cart value
    public double calculateTotal(Customer customer) {
        return cartRepository.findByCustomer(customer)
                .stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
    }

    // Clear all cart items belonging to a customer
    @Transactional
    public void clearCart(Customer customer) {
        cartRepository.deleteByCustomer(customer);
    }

    // Update the quantity of a cart item
    @Transactional
    public void updateQuantity(
            Long cartItemId,
            int newQuantity) {

        if (newQuantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        CartItem item = cartRepository.findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found")
                );

        item.setQuantity(newQuantity);

        cartRepository.save(item);
    }
}