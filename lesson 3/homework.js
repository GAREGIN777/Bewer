
//Every field is used as logical without my cr_133 prefix
// Task 1: Disable and Autofill Currency in "Price List Item" from "Price List"



function autofillCurrencyFromPriceListItem(executionContext) {
    const formContext = executionContext.getFormContext();
    const priceListId = formContext.getAttribute("priceListId").getValue();

    if (priceListId) {
        Xrm.WebApi.retrieveRecord("priceList", priceListId[0].id, "?$select=currency").then(
            function (result) {
                const currency = result.currency;
                formContext.getAttribute("currency").setValue(currency);
                formContext.getControl("currency").setDisabled(true);
            },
            function (error) {
                console.log("Error retrieving Price List:", error.message);
            }
        );
    }
}


// Task 2: Hide "Name" Field and Autofill from "Product" in "Price List Item"

function autofillNameFromProduct(executionContext) {
    const formContext = executionContext.getFormContext();
    const productId = formContext.getAttribute("productId").getValue();

    if (productId) {
        Xrm.WebApi.retrieveRecord("product", productId[0].id, "?$select=name").then(
            function (result) {
                formContext.getAttribute("name").setValue(result.name);
                formContext.getControl("name").setVisible(false);
                formContext.getControl("ownerid").setVisible(false);
            },
            function (error) {
                console.log("Error retrieving Product:", error.message);
            }
        );
    }
}


// Task 8: Disable Currency in "Inventory Product" and Autofill from Price List (Linked Query with fetchXml)

function autofillCurrencyInInventoryProduct(executionContext) {
    const formContext = executionContext.getFormContext();
    const inventoryId = formContext.getAttribute("inventoryId").getValue();

    if (inventoryId) {
        const fetchXml = `
        <fetch top="1">
          <entity name="inventory">
            <attribute name="currency" />
            <link-entity name="priceList" from="priceListId" to="priceListId" alias="pl">
              <attribute name="currency" />
            </link-entity>
            <filter>
              <condition attribute="inventoryid" operator="eq" value="${inventoryId[0].id}" />
            </filter>
          </entity>
        </fetch>`;

        Xrm.WebApi.retrieveMultipleRecords("inventory", `?fetchXml=${encodeURIComponent(fetchXml)}`).then(
            function (result) {
                if (result.entities.length > 0) {
                    const currency = result.entities[0]["pl.currency"];
                    formContext.getAttribute("currency").setValue(currency);
                    formContext.getControl("currency").setDisabled(true);
                }
            },
            function (error) {
                console.log("Error retrieving Inventory and Price List:", error.message);
            }
        );
    }
}


// Task 9: Disable "Price Per Unit" in "Inventory Product" Form and Autofill Price (using fetchXml)

function autofillPricePerUnitInInventoryProduct(executionContext) {
    const formContext = executionContext.getFormContext();
    const productId = formContext.getAttribute("productId").getValue();
    const priceListId = formContext.getAttribute("priceListId").getValue();

    if (priceListId && productId) {
        const fetchXml = `
        <fetch top="1">
          <entity name="priceListItem">
            <attribute name="pricePerUnit" />
            <filter type="and">
              <condition attribute="priceListId" operator="eq" value="${priceListId[0].id}" />
              <condition attribute="productId" operator="eq" value="${productId[0].id}" />
            </filter>
          </entity>
        </fetch>`;

        Xrm.WebApi.retrieveMultipleRecords("priceListItem", `?fetchXml=${encodeURIComponent(fetchXml)}`).then(
            function (result) {
                if (result.entities.length > 0) {
                    const pricePerUnit = result.entities[0].pricePerUnit;
                    formContext.getAttribute("pricePerUnit").setValue(pricePerUnit);
                    formContext.getControl("pricePerUnit").setDisabled(true);
                } else {
                    const fetchProductXml = `
                    <fetch top="1">
                      <entity name="product">
                        <attribute name="defaultPricePerUnit" />
                        <filter>
                          <condition attribute="productId" operator="eq" value="${productId[0].id}" />
                        </filter>
                      </entity>
                    </fetch>`;

                    Xrm.WebApi.retrieveMultipleRecords("product", `?fetchXml=${encodeURIComponent(fetchProductXml)}`).then(
                        function (productResult) {
                            if (productResult.entities.length > 0) {
                                formContext.getAttribute("pricePerUnit").setValue(productResult.entities[0].defaultPricePerUnit);
                                formContext.getControl("pricePerUnit").setDisabled(true);
                            }
                        },
                        function (error) {
                            console.log("Error retrieving Product:", error.message);
                        }
                    );
                }
            },
            function (error) {
                console.log("Error retrieving Price List Item:", error.message);
            }
        );
    }
}
