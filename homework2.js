
function managePriceListItems(executionContext) {
    var formContext = executionContext.getFormContext();
    var priceListId = formContext.data.entity.getId().replace("{", "").replace("}", "");

    // 1. Fetch all Price List Items associated with the Price List using FetchXML
    var fetchXmlPriceListItems = `<fetch>
        <entity name="cr_133_pricelistitem">
            <filter>
                <condition attribute="fk_pricelist" operator="eq" value="${priceListId}" />
            </filter>
        </entity>
    </fetch>`;

    Xrm.WebApi.retrieveMultipleRecords("cr_133_pricelistitem", "?fetchXml=" + encodeURIComponent(fetchXmlPriceListItems))
        .then(function (result) {
            var deletePromises = result.entities.map(function (item) {
                return Xrm.WebApi.deleteRecord("cr_133_pricelistitem", item.cr_133_pricelistitemid);
            });

            return Promise.all(deletePromises);
        })
        .then(function (result) {
            var createPromises = result.entities.map(function (product) {
                var priceListItem = {
                    "fk_pricelist@odata.bind": "/cr_133_pricelists(" + priceListId + ")",
                    "productid@odata.bind": "/products(" + product.productid + ")",
                    "transactioncurrencyid@odata.bind": "/transactioncurrencies(" + formContext.getAttribute("transactioncurrencyid").getValue()[0].id + ")",
                    "amount": 1,
                    "name": product.name
                };

                return Xrm.WebApi.createRecord("cr_133_pricelistitem", priceListItem);
            });

            return Promise.all(createPromises);
        })
        .then(function () {
            Xrm.Navigation.openAlertDialog({ text: "Price List Items have been successfully updated." });
        })
        .catch(function (error) {
            console.error("Error while managing Price List Items: ", error.message);
            Xrm.Navigation.openErrorDialog({ message: error.message });
        });
}

  
//Task 3

function onProductSelect(executionContext) {
    var formContext = executionContext.getFormContext();

    // Get the current fk_product value from the Inventory form
    var existingProduct = formContext.getAttribute("fk_product").getValue();

    // Get the newly selected product from the product lookup field
    var selectedProduct = formContext.getAttribute("productid").getValue();

    if (!selectedProduct) {
        // If no product is selected, do nothing
        formContext.getControl("productid").clearNotification(); // Clear any existing notifications
        return;
    }

    var selectedProductId = selectedProduct[0].id.replace("{", "").replace("}", "");

    if (existingProduct && existingProduct[0].id.replace("{", "").replace("}", "") === selectedProductId) {
        // If the selected product is the same as the existing fk_product
        formContext.getControl("productid").setNotification("This product is already associated with the inventory.");
        
        // Optionally, clear the selection to prevent duplicate association
        formContext.getAttribute("productid").setValue(null);
    } else {
        // Clear any existing notifications if products don't match
        formContext.getControl("productid").clearNotification();
    }
}
