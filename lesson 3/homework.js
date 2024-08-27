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
