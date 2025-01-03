let selectedProducts = [];
let maxBoxItems = 6; // Maximum items in the box
let selectedNumber = null;
let totalAmount = 0;
const data = {
    4: 'build-a-pack-4-pack',
    8: 'build-a-pack-8-pack',
    12: 'build-a-pack-12-pack'
};


let products = []; // Declare an empty array to hold product data

function setProducts(productData) {
    products = productData; // Assign fetched product data to the products array

}
// Get the current time in the user's local timezone
const now = new Date();

// Create a date object for midnight UK time (00:00) today in the user's local timezone
const targetDate = new Date();

// Set the target time to 12:00 AM (midnight) in the UK (GMT/BST)
// Create a target midnight time in the UK timezone (UTC+0)
targetDate.setUTCHours(24, 0, 0, 0); // Sets target time to midnight of the current day in UTC

// Adjust the target date to the next midnight if it's already past midnight in the user's time zone
if (now > targetDate) {
    targetDate.setUTCDate(targetDate.getUTCDate() + 1); // Set target to the next midnight
}

// Function to update the timer
function updateTimer() {
    const now = new Date();
    const timeDifference = targetDate - now;

    // Select the container with aria-label "countdown-timer"
    const countdownContainers = document.querySelectorAll('[aria-label="countdown-timer"]');

    if (timeDifference <= 0) {
        countdownContainers.forEach(container => {
            container.textContent = "Time's up!";
        });
        return;
    }

    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);

    // Update elements with aria-labels
    document.querySelectorAll('[aria-label="hours"]').forEach(el => {
        el.textContent = String(hours).padStart(2, '0');
    });
    document.querySelectorAll('[aria-label="minutes"]').forEach(el => {
        el.textContent = String(minutes).padStart(2, '0');
    });
    document.querySelectorAll('[aria-label="seconds"]').forEach(el => {
        el.textContent = String(seconds).padStart(2, '0');
    });
}

// Update the timer every second
setInterval(updateTimer, 1000);

// Initialize the timer
updateTimer();



function randomizeProducts() {
    const selectedProducts = [];

    var i = 0;

    // Randomly select products
    while (i < maxBoxItems) {
        const randomIndex = Math.floor(Math.random() * products.length);
        const randomProduct = products[randomIndex];

        selectedProducts.push(randomProduct);

        i++;
    }

    const namesArray = selectedProducts.map(item => item.name);
    updateStaticProductProperties(namesArray);

    // Add selected products to the box
    selectedProducts.forEach(product => {
        addToBox(product.id, product.title, product.featured_image,product.varId,product.handle);
    });
}

window.onload = function() {

    const element = document.querySelector('[aria-label="Edit Selection"]');
    element.style.display = "none";




    if(!isBoxLimitSet())
        setBoxLimit(8,false); // Set your default box limit here (e.g., 2, 6, or 8)
};

function setBoxLimit(limit,wantLoad) {
    if (![4, 8, 12].includes(limit)) {
        alert("Invalid box limit. Please choose 2, 6, or 8.");
        return;
    }

    const isSmallerThanOrEqualSm = window.matchMedia("(max-width: 786px)").matches;
    if(isSmallerThanOrEqualSm)
        document.getElementById('box-item-list-wrapper').style.display = "none";


    document.getElementById('bap-review').classList.add('pack-preview-closed');

    // if(limit >= 8)
    //     document.getElementById('bap-review').classList.add('more-than-8')
    // else
    //     document.getElementById('bap-review').classList.remove('more-than-8')


    maxBoxItems = limit; // Set the box limit to the chosen value
    clearBox(wantLoad); // Clear the box for a new selection
    setStaticProduct(limit); // Set the selected product ID in the hidden input field

    const ulObj = document.getElementById('boxItemsList');
    // if(limit == 4)
    // {
    //     ulObj.classList.remove('lg:grid-cols-4');
    //     ulObj.classList.add('lg:grid-cols-3');
    // }
    // else{
    // }

    // Store the limit in localStorage
    localStorage.setItem("selectedBoxLimit", limit);


    // Select the ul element with the id "boxItemsList" and remove 'selected' class from its li children
    const boxItemsList = document.getElementById("numberList");
    if (boxItemsList) {
        boxItemsList.querySelectorAll(".selected").forEach(li => li.classList.remove("selected"));
    }

    // Add the 'selected' class to the specific li element corresponding to the selected limit
    const selectedLi = document.getElementById(`li-${limit}`);
    if (selectedLi) {
        selectedLi.classList.add("selected");
    }


    // const boxItemsList = document.getElementById("boxItemsList");

    // Fill the box with placeholder slots based on the selected limit
    // for (let i = 0; i < maxBoxItems; i++) {
    //     const placeholderItem = document.createElement("li");
    //     placeholderItem.className = "rounded-3xl box-slot placeholder";
    //     placeholderItem.innerHTML = `<img src="assets/placeholder.webp" alt="Placeholder" class="rounded-3xl placeholder-image" />`; // Replace with actual image path
    //     boxItemsList.appendChild(placeholderItem);
    // }
    //
    //
    //
  
}


async function setStaticProduct(limit) {
    try {
        // Await the fetch and make sure you parse the response as JSON
        const response = await fetch(`${window.Shopify.routes.root}products/${data[limit]}.js`);
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`Failed to fetch product data for ${data[limit]}`);
        }

        // Parse the JSON response
        const productData = await response.json();
        
        // Call the function to update the total price with the variant's price
        setAmountToTotal(productData.variants[0].price);
        // Set the selected product ID in the hidden input field
        document.getElementById("static-product").value = productData.variants[0].id;
    } catch (error) {
        console.error('Error:', error);
    }
}


// Function to set the stored limit
function setStoredLimit(wantLoad) {
    const storedLimit = localStorage.getItem("selectedBoxLimit");
    if (storedLimit) {
        // Convert to number and call setBoxLimit
        setBoxLimit(Number(storedLimit), wantLoad);
    }
}

// Call setStoredLimit when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    setStoredLimit(false); // Pass `false` as wantLoad
});

function addToBox(productId, productName, productImage,price,variantId,prodHandle) {
        
    let productVal = document.getElementById(`quantity-${productId}`).value;

    document.getElementById('bap-review').classList.remove('pack-preview-closed');

    document.getElementById('box-item-list-wrapper').style.removeProperty('display');


    if (selectedProducts.length >= maxBoxItems) {
        return;
    }

    //addAmountToTotal(price);

    if(productVal < 1){
        document.getElementById(`bap-doughnut_${productId}`).style.display = 'block';
        document.getElementById(`add-btn-${productId}`).style.display = 'none';
        document.getElementById(`quantity-${productId}`).value = 1;
    }



    selectedProducts.push({ id: productId, name: productName, image: productImage,varId:variantId,handle:prodHandle });
    const namesArray = selectedProducts.map(item => item.name);
    updateStaticProductProperties(namesArray);


    if(selectedProducts.length >= maxBoxItems) {
        document.getElementById("number-selection").style.display = "block";
        document.getElementById("box-selections-funcs").style.display = "none";
        document.getElementById("add-to-cart").style.display = "block";

        const isSmallerThanOrEqualSm = window.matchMedia("(max-width: 786px)").matches;

        if(isSmallerThanOrEqualSm){
            document.getElementById('bap-review').classList.add('open');
            const element = document.querySelector('[aria-label="Edit Selection"]');
            element.style.removeProperty('display');
        }


    }

    updateBoxUI();

    
}


function addAmountToTotal(price) {
    totalAmount += (price / 100);
    // console.log("Total Amount: " , totalAmount);
    // console.log("Price: " , price);
    document.getElementById('bap-pack-price-preview').innerHTML = `$${totalAmount}`;
}
function setAmountToTotal(price) {
    totalAmount = (price / 100);
    // console.log("Total Amount: " , totalAmount);
    // console.log("Price: " , price);
    document.getElementById('bap-pack-price-preview').innerHTML = `$${totalAmount}`;
}


function clearBox(wantLoad) {
    selectedProducts = [];
    selectedNumber = null;
    updateStaticProductProperties([]);
    document.getElementById("number-selection").style.display = "none";
    document.getElementById("additional-info").style.display = "none";
    document.getElementById("box-selections-funcs").style.display = "block";

    updateBoxUI();

    if(wantLoad)
        location.reload();

}


function updateBoxUI() {
    const boxItemsList = document.getElementById("boxItemsList");
    boxItemsList.innerHTML = ""; // Clear the list

    for (let i = 0; i < maxBoxItems; i++) {
        const item = document.createElement("li");
        item.className = "rounded-3xl box-slot ";

        if (selectedProducts[i]) {
            // Product slot
            item.innerHTML = `
                <div class="product-item w-full h-full" onmouseover="showRemoveIcon(this)" onmouseout="hideRemoveIcon(this)">
                    <img src="${selectedProducts[i].image}" alt="${selectedProducts[i].name}" class="rounded-3xl product-image h-full" />
<!--                    <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20" fill="none" style="margin: 4px; padding: 5px; display: flex; align-items: center; justify-content: center;" >-->
<!--                          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#FFFFFF"></path>-->
<!--                        </svg>-->
                    <div onclick="decreaseQuantity(${selectedProducts[i].id})" id="remove-doughnut-0" x-transition="" class="remove-icon bap-remove-selected-doughnut cursor-pointer" data-doughnut-id="doughnut_JBVbGX" x-show="show" style="display: none; opacity: 1; transform: scale(1); transform-origin: center center; transition-property: opacity, transform; transition-duration: 0.075s; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" style="position: relative;margin: 4px 4px;">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#FFFFFF"></path>
                        </svg>
                     </div>
<!--                    <span class="remove-icon" >×</span>-->
                </div>
            `;
        } else {
            // Placeholder slot
            item.innerHTML = `<img src="https://cdn.shopify.com/s/files/1/0901/2340/3544/files/samosa-icon.png?v=1731504729" alt="Placeholder" class="rounded-3xl placeholder-image" />`;
        }

        boxItemsList.appendChild(item);
    }
}


function removeProduct(index) {
    // if(selectedProducts.length <= 1 )
    //     document.getElementById('bap-review').classList.remove('pack-preview-closed');


    if(selectedProducts.length >= maxBoxItems){
        document.getElementById("number-selection").style.display = "none";
        document.getElementById("additional-info").style.display = "none";
        document.getElementById("box-selections-funcs").style.display = "block";
        document.getElementById("add-to-cart").style.display = "none";
        document.getElementById('bap-review').classList.remove('open');
        document.querySelector('[aria-label="Edit Selection"]').style.display="none";

    }
    selectedProducts.splice(index, 1);
    const namesArray = selectedProducts.map(item => item.name);
    updateStaticProductProperties(namesArray);

    updateBoxUI();
}

// Functions to show and hide the remove icon
function showRemoveIcon(item) {
    item.querySelector(".remove-icon").style.display = "flex";
}

function hideRemoveIcon(item) {
    item.querySelector(".remove-icon").style.display = "none";
}

var cardPrice = 0;
var cardProduct = null;

function selectNumber(variantId,price) {
    if(variantId != null){
        
        console.log(price);
        // selectedNumber = number;
        cardPrice = price;
        // console.log(price);
        addAmountToTotal(cardPrice);
        // cardProduct = {price,variantId};
        document.getElementById("gift-card-id").value = variantId.toString();
        document.getElementById("additional-info").style.display = "block";
        document.getElementById("number-selection").style.display = "none";
    }
}

function selectCard(){

    // selectedNumber = 0;
    addAmountToTotal(-cardPrice);
    cardPrice = 0;
    // cardProduct = null;
    document.getElementById("gift-card-id").value = "";

    document.getElementById("additional-info").style.display = "none";
    document.getElementById("number-selection").style.display = "block";
}
// function addToCart() {
//     const bundleName = "Custom Donut Bundle"; // Name of the bundle
//     const bundleProducts = selectedProducts.map(product => ({
//         name: product.name,
//         varId: product.varId,
//         quantity: product.quantity || 1,
//     }));
//     const bundleId = `bundle-${Date.now()}`; // Unique identifier for the bundle

//     const bundleProperties = {
//         bundle_name: bundleName,
//         included_products: JSON.stringify(bundleProducts),
//     };

//     const uniqueProducts = selectedProducts.reduce((acc, product) => {
//         const existingProduct = acc.find(p => p.varId === product.varId);

//         if (existingProduct) {
//             existingProduct.quantity += product.quantity || 1;
//         } else {
//             acc.push({
//                 name: product.name,
//                 handle: product.handle,
//                 varId: product.varId,
//                 quantity: product.quantity || 1,
//             });
//         }

//         return acc;
//     }, []);

//     const stockCheckPromises = uniqueProducts.map(product => {
//         const productHandle = product.handle;

//         return fetch(`${window.Shopify.routes.root}products/${productHandle}.js`)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`Failed to fetch product data for ${product.name}`);
//                 }
//                 return response.json();
//             })
//             .then(productData => {
//                 const variant = productData.variants.find(variant => variant.id === product.varId);
//                 if (!variant) {
//                     throw new Error(`Variant not found for ${product.name}`);
//                 }

//                 if (variant.inventory_quantity < product.quantity) {
//                     throw new Error(
//                         `Insufficient stock for ${product.name}. Available: ${variant.inventory_quantity}, Required: ${product.quantity}`
//                     );
//                 }

//                 return {
//                     name: product.name,
//                     varId: product.varId,
//                     requestedQuantity: product.quantity,
//                     availableQuantity: variant.inventory_quantity,
//                     price: variant.price,
//                     isAvailable: true,
//                 };
//             })
//             .catch(() => {
//                 return {
//                     isAvailable: false,
//                 };
//             });
//     });

//     Promise.all(stockCheckPromises)
//         .then(stockData => {
//             const unavailableProducts = stockData.filter(product => !product.isAvailable);
//             console.log(stockData);
//             if (unavailableProducts.length > 0) {
//                 const unavailableNames = unavailableProducts
//                     .map(product => `${product.name} (Requested: ${product.requestedQuantity}, Available: ${product.availableQuantity})`)
//                     .join('\n');
//                 alert(`The following products are not available in the required quantities:\n${unavailableNames}`);
//                 return;
//             }

//             const totalCost = stockData.reduce((sum, product) => {
//                 if (product.isAvailable) {
//                     return sum + (product.price / 100 * product.requestedQuantity);
//                 }
//                 return sum;
//             }, 0);

//             bundleProperties.total_cost = totalCost;

//             return fetch('/cart.js', {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch cart. HTTP status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(cart => {
//             const existingBundle = cart.items.find(item => {
//                 return (
//                     item.properties &&
//                     item.properties.bundle_name === bundleName &&
//                     item.properties.included_products === JSON.stringify(bundleProducts)
//                 );
//             });


//             if (cardProduct !== null) {
//                 var cartMessage = document.getElementById('greeting-card-message').value;
//                 const cardPayload = {
//                     items: [
//                         {
//                             id: cardProduct.variantId,
//                             quantity: 1,
//                             properties: {
//                                 card_message: cartMessage,
//                             },
//                         },
//                     ],
//                 };
//                 console.log(cardPayload);
            
//                 const existingCard = cart.items.find(item => 
//                     item.id === cardProduct.variantId && 
//                     item.properties && 
//                     item.properties.card_message === cartMessage
//                 );
            
//                 if (existingCard) {
//                     // Update the quantity of the existing card
//                     const lineIndex = cart.items.findIndex(item => item === existingCard) + 1;
            
//                     return fetch('/cart/change.js', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             line: lineIndex,
//                             quantity: existingCard.quantity + 1,
//                         }),
//                     });
//                 } else {

//                     // Add a new card to the cart
//                     return fetch('/cart/add.js', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify(cardPayload),
//                     });
//                 }

//             }
            

//             if (existingBundle) {
//                 const lineIndex = cart.items.findIndex(item => item === existingBundle) + 1;

//                 const updatedPayload = {
//                     line: lineIndex,
//                     quantity: existingBundle.quantity + 1,
//                 };

//                 return fetch('/cart/change.js', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(updatedPayload),
//                 });
//             } else {
//                 const payload = {
//                     items: [
//                         {
//                             id: selectedProducts[0].varId,
//                             quantity: 1,
//                             properties: {
//                                 ...bundleProperties,
//                                 bundle_id: bundleId,
//                             },
//                         },
//                     ],
//                 };

//                 return fetch('/cart/add.js', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(payload),
//                 });
//             }
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Failed to update cart. HTTP status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Cart updated:', data);
//             alert(`Bundle "${bundleName}" has been updated in the cart with a total cost of $${bundleProperties.total_cost}.`);
//         })
//         .catch(error => {
//             console.error('Error managing cart:', error);
//         });
// }


function removeLast(){
    decreaseQuantity(selectedProducts[selectedProducts.length-1].id);
}



// Function to increase quantity
function increaseQuantity(id) {

    if(selectedProducts.length >= maxBoxItems){
        return;
    }
    const quantityInput = document.getElementById(`quantity-${id}`);
    let quantity = parseInt(quantityInput.value);
    quantity++;
    quantityInput.value = quantity;
}

// Function to decrease quantity
function decreaseQuantity(id) {
    const quantityInput = document.getElementById(`quantity-${id}`);
    let quantity = parseInt(quantityInput.value);

    if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
    } else {
        // If quantity is 0, hide quantity div and show Add button
        quantityInput.value = 0;
        document.getElementById(`bap-doughnut_${id}`).style.display = 'none';
        document.getElementById(`add-btn-${id}`).style.display = 'block';
    }

    for (var i = 0 ; i < selectedProducts.length ; i++){
        if(selectedProducts[i].id == id){
            removeProduct(i);
            break;
        }
    }
}

// Function to check if the box limit is set in localStorage
function isBoxLimitSet() {
    const storedLimit = localStorage.getItem("selectedBoxLimit");
    return storedLimit !== null; // Returns true if the limit is set, false otherwise
}

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggle-button');
    const deliveryDetails = document.getElementById('delivery-details');

    toggleButton.addEventListener('click', function () {
        const isOpen = deliveryDetails.style.maxHeight && deliveryDetails.style.maxHeight !== '0px';
        deliveryDetails.style.maxHeight = isOpen ? '0' : '500px'; // Adjust 500px to fit your content's height
        toggleButton.setAttribute('aria-expanded', !isOpen);
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggle-button-2');
    const deliveryDetails = document.getElementById('delivery-details-2');

    toggleButton.addEventListener('click', function () {
        const isOpen = deliveryDetails.style.maxHeight && deliveryDetails.style.maxHeight !== '0px';
        deliveryDetails.style.maxHeight = isOpen ? '0' : '500px'; // Adjust 500px to fit your content's height
        toggleButton.setAttribute('aria-expanded', !isOpen);
    });
});


// event listener for the gift card message input
document.addEventListener("DOMContentLoaded", function () {
    const messageBox = document.getElementById("greeting-card-message");
    const charsLeftElement = document.querySelector(".gift-message-chars-left");
  
    // Handle the 'onchange' and 'onkeyup' events
    messageBox.addEventListener("input", function () {
      const remainingChars = 200 - this.value.length;
      charsLeftElement.textContent = remainingChars;
  
      // Update the gift card message dynamically (if required elsewhere in the app)
      updateGiftCardMessage(this.value);
    });
  
    // Function to update the gift card message
    function updateGiftCardMessage(message) {
      document.getElementById("gift-card-message").value = message;
      // Add additional logic here to handle the updated message, e.g., sending it to a hidden field
    }
  });


  // Function to update static product properties
function updateStaticProductProperties(products) {
    // Sort product names to ensure canonical order
    const sortedProducts = products.sort().join(", ");
    document.getElementById("static-product-properties").value = sortedProducts;
  }
  

// in case no card is selected
  document.getElementById('dynamic-cart-form').addEventListener('submit', function(event) {
    // Check if the gift card ID is empty
    var giftCardId = document.getElementById('gift-card-id').value;

    // If the gift card ID is empty, remove the gift card fields from the form
    if (!giftCardId) {
      // Remove the gift card properties from the form data
      document.getElementById('gift-card-id').remove();
      document.getElementById('gift-card-message').remove();
    }
  });