// Event listener for the "Search" button
document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the value from the search input field
    const bloodType = document.getElementById("searchInput").value;

    // Log the blood type to the console
    console.log("Searching for blood type:", bloodType);

    // You can add your search functionality here
    // Example: Perform an AJAX request to search for blood type
    // fetch('your-server-endpoint', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ bloodType: bloodType })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Success:', data);
    // })
    // .catch((error) => {
    //     console.error('Error:', error);
    // });
});

// Event listener for the "Become a Donor" link
document.getElementById("becomeDonorLink").addEventListener("click", function(event) {
    event.preventDefault();
    // Add code to handle the "Become a Donor" form pop-up if needed
    console.log("Become a Donor link clicked");

    // Display the donor form container
    document.getElementById("donorFormContainer").style.display = "block";
    // Blur the background (add a class or directly set the style)
    document.body.style.filter = "blur(5px)";
});

// Event listener for closing the donor form
document.getElementById("closeDonorForm").addEventListener("click", function() {
    // Hide the donor form container
    document.getElementById("donorFormContainer").style.display = "none";
    // Remove the blur from the background
    document.body.style.filter = "none";
});
