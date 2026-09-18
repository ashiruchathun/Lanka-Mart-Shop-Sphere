package com.lankamartshopsphere.controller;

import com.lankamartshopsphere.model.Customer;
import com.lankamartshopsphere.model.Product;
import com.lankamartshopsphere.repository.ProductRepository;
import com.lankamartshopsphere.service.CartService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/customer/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepository;

    // Add an electronic product to the cart
    @PostMapping("/add")
    public String addToCart(
            @RequestParam Long productId,
            @RequestParam int quantity,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        // Retrieve the logged-in customer
        Customer customer =
                (Customer) session.getAttribute("loggedUser");

        String role = (String) session.getAttribute("role");

        // Check whether the customer is logged in
        if (customer == null || !"CUSTOMER".equals(role)) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    "Please sign in to add products to your cart."
            );

            return "redirect:/login";
        }

        // Validate quantity
        if (quantity < 1) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    "Please select a valid quantity."
            );

            return "redirect:/customer/products";
        }

        // Find the selected electronic product
        Product product =
                productRepository.findById(productId).orElse(null);

        if (product == null) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    "The selected product could not be found."
            );

            return "redirect:/customer/products";
        }

        try {

            cartService.addToCart(
                    customer,
                    product,
                    quantity
            );

            redirectAttributes.addFlashAttribute(
                    "success",
                    quantity + " " + product.getName()
                            + "(s) added to your cart!"
            );

        } catch (Exception e) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    "Failed to add the product to your cart."
            );
        }

        return "redirect:/customer/products";
    }

    // Remove an item from the cart
    @DeleteMapping("/remove/{id}")
    @ResponseBody
    public ResponseEntity<String> removeItem(
            @PathVariable Long id) {

        try {

            cartService.removeFromCart(id);

            return ResponseEntity.ok("Item removed successfully");

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing item");
        }
    }

    // Update the quantity of a cart item
    @PostMapping("/update/{id}")
    @ResponseBody
    public ResponseEntity<String> updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity) {

        try {

            if (quantity < 1) {
                return ResponseEntity
                        .badRequest()
                        .body("Quantity must be greater than zero");
            }

            cartService.updateQuantity(id, quantity);

            return ResponseEntity.ok(
                    "Quantity updated successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating quantity");
        }
    }

    // Display the cart page
    @GetMapping
    public String viewCart() {
        return "customer/cart";
    }
}