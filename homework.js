/* Task 1: Disable and Set Name Field Programmatically */

function onLoad_DisableAndSetName(executionContext) {
    var formContext = executionContext.getFormContext();
    var nameField = formContext.getAttribute("name"); 
    var lookupField = formContext.getAttribute("lookup"); 
    
    if (lookupField && lookupField.getValue()) {
        var lookupName = lookupField.getValue()[0].name;
        nameField.setValue(lookupName);
    }

    nameField.setRequiredLevel("none");
    formContext.getControl("name").setDisabled(true);
}


/* Task 2: Show/Hide "Price Per Unit" Based on "Type" (Product)*/

function onChange_TogglePricePerUnit(executionContext) {
    var formContext = executionContext.getFormContext();
    var typeField = formContext.getAttribute("type"); 
    var pricePerUnitControl = formContext.getControl("priceperunit"); 

    if (typeField && typeField.getValue() === "Product") { //or option set get selected value
        pricePerUnitControl.setVisible(true);
    } else {
        pricePerUnitControl.setVisible(false);
    }
}

/* Task 3: Calculate "Total Amount" Based on "Quantity" and "Price Per Unit" */

function onChange_CalculateTotalAmount(executionContext) {
    var formContext = executionContext.getFormContext();
    var quantity = formContext.getAttribute("quantity").getValue(); // Assuming the schema name is 'quantity'
    var pricePerUnit = formContext.getAttribute("priceperunit").getValue(); // Replace 'priceperunit' with the actual field schema name
    var totalAmountControl = formContext.getControl("totalamount"); // Replace 'totalamount' with the actual field schema name

    if (quantity !== null && pricePerUnit !== null) {
        var totalAmount = quantity * pricePerUnit;
        formContext.getAttribute("totalamount").setValue(totalAmount);
    }

    totalAmountControl.setDisabled(true);
}


/* Task 4: Disable All Fields if Record is Created (Update Form Type) */

function onLoad_ToggleFieldsBasedOnFormType(executionContext) {
    var formContext = executionContext.getFormContext();
    var formType = formContext.ui.getFormType();
    var allControls = formContext.ui.controls.get();

    if (formType === 2) { // Form Type 2 indicates the form is in Update mode
        allControls.forEach(function(control) {
            control.setDisabled(true);
        });
    } else if (formType === 1) { // Form Type 1 indicates the form is in Create mode
        allControls.forEach(function(control) {
            control.setDisabled(false);
        });
    }
}
