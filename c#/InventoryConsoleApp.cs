using Microsoft.Crm.Sdk.Messages;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.CodeDom;
using System.Linq.Expressions;

class Program
{
    // TODO Enter your Dataverse environment's URL and logon info.
    static string url = "https://orga15424f5.crm4.dynamics.com/";
    static string userName = "gareginvardanyan@beversystems682.onmicrosoft.com";
    static string password = "Garegin_Bever88831";

    // This service connection string uses the info provided above.
    // The AppId and RedirectUri are provided for sample code testing.
    static string connectionString = $@"
   AuthType = OAuth;
   Url = {url};
   UserName = {userName};
   Password = {password};
   AppId = 51f81489-12ee-4a9e-aaae-a2591f45987d;
   RedirectUri = app://58145B91-0C36-4500-8554-080854F2AC97;
   LoginPrompt=Auto;
   RequireNewInstance = True";



    public static IOrganizationService service;

    public static Guid invUid;
    public static Guid prodUid;
    /*public static string operationType; //enum would be far more preferrable*/
    public static short prodQuantity;
    static void Main()
    {
       
        Console.WriteLine("Waiting for connection...");
        //ServiceClient implements IOrganizationService interface
         service = new ServiceClient(connectionString);

            var response = (WhoAmIResponse)service.Execute(new WhoAmIRequest());

            Console.WriteLine($"User ID is {response.UserId}.");
       appMainRef:
 
        // Pause the console so it does not close.
        while (true)
        {
            Console.WriteLine("");
            Console.Write("Enter Inventory Name: ");
            string inventoryName = Console.ReadLine().Trim();

            if (!string.IsNullOrEmpty(inventoryName))
            {
                Guid invCheckUid = RetrieveRecordIdByName("cr76a_inventory", "cr76a_name", inventoryName);
                if (invCheckUid != Guid.Empty)
                {
                    invUid = invCheckUid;
                    Console.WriteLine($"Inventory name entered: {inventoryName}");
                    break;
                }
                else
                {
                    Console.WriteLine($"Inventory {inventoryName} not found");
                }
            }
            else
            {
                Console.WriteLine("Error: Inventory name cannot be empty. Please try again.");
            }
        }


        while (true) {
            Console.WriteLine("");
            Console.Write("Enter Product Name: ");
            string productName = Console.ReadLine().Trim();
            if (!String.IsNullOrEmpty(productName)){
                prodUid = RetrieveRecordIdByName("cr76a_product", "cr76a_name",productName);
                if (prodUid != Guid.Empty) {
                    Console.WriteLine("Product was found in db");
                }
                else{
                    Console.Clear();
                    Console.Write("Product was not found in db\nWe will create or delete product for you\nDo you want to Restart?(Yes / No): ");
                    bool isRestarted = Console.ReadLine().Trim().ToLower() == "yes";
                    if (isRestarted)
                    {
                        goto appMainRef;
                    }
                    else { 
                       createInventoryProduct(productName);
                    }
                }
                break;
            }
            Console.WriteLine("Product name is required");
        }


        while (true)
        {
            Console.WriteLine("");
            Console.Write($"Enter Quantity (from {short.MinValue} to {short.MaxValue}), not '0': ");
            if (short.TryParse(Console.ReadLine(), out prodQuantity) && prodQuantity != 0)
            {
                break;
            }
            else
            {
                Console.WriteLine("Invalid quantity. Please enter a valid number.");
            }
        }

       

        // Validate Operation
        /*while (true)
        {
            Console.WriteLine("");
            Console.Write("Enter Operation Type (Addition / Subtraction): ");
            String operation =  Console.ReadLine().Trim().ToLower();

            if (operation == "addition" || operation == "subtraction")
            {
                operationType = operation;
                Console.WriteLine($"Processing {operation} operation.");
                break;
            }
            else
            {
                Console.WriteLine("Invalid operation type. Please enter 'Addition' or 'Subtraction'.");
            }
        }*/

        /*invUid;
        Guid prodUid;
        string operationType; //enum would be far more preferrable
        short prodQuantity;*/
       
        processFurther();

        /*if (String.IsNullOrEmpty(inventoryName) && quantity >= 0 && operation) {
            Guid inventoryUid = RetrieveRecordIdByName("cr76a_inventory", "cr76a_name", inventoryName);
            Console.WriteLine($"Inventory found {inventoryUid.ToString()}");



            Console.Write($"Processing {operation} operation \nProduct - {productName}\nInventory - {inventoryName}");
        }*/
       
    }

    private static void processFurther()
    {
        
        Console.Clear();
        Console.WriteLine("Processing your data...");
       // if (prodQuantity < 0) {
            Entity invProduct = retrieveInvProdByLookups();
            int qnt = invProduct.GetAttributeValue<int>("cr76a_quantity");
        int resQnt = qnt + prodQuantity;
        if (resQnt <= 0)
        {
            System.Console.WriteLine("We will delete product + inventory product for\n");
            service.Delete(invProduct.LogicalName,invProduct.Id);
            service.Delete("cr76a_product", prodUid);
            System.Console.WriteLine("We have deleted product + inventory product");
            return;
        }
        updateInvProdQuantity(invProduct,resQnt);
            
            Console.WriteLine($"Stored Quantity was - {qnt} \nNow is - {resQnt}");
       // }
       

    }


    private static void createInventoryProduct(string prodName) {
        Entity exampleProd = new Entity("cr76a_product"); // for update
        exampleProd["cr76a_name"] = prodName;
        try
        {
            Guid nProdUid = service.Create(exampleProd);

            Entity exampleInvProduct = new Entity("cr76a_inventoryproduct");
            exampleInvProduct["cr76a_name"] = $"inv_{prodName}";
            exampleInvProduct["cr76a_product"] = new EntityReference("cr76a_product",nProdUid);
            exampleInvProduct["cr76a_inventory"] = new EntityReference("cr76a_inventory", invUid);
            service.Create(exampleInvProduct);


            prodUid = nProdUid;



        }
        catch (Exception ex) {
            Console.WriteLine($"Error Creating Product {ex.Message}");
        }
    }

    private static void updateInvProdQuantity(Entity currentInvProd,int n_quantity)
    {
        //no checks in method
        Entity emptyInvProd = new Entity("cr76a_inventoryproduct"); // for update
        emptyInvProd.Id = currentInvProd.Id;
        emptyInvProd["cr76a_quantity"] = n_quantity;
        service.Update(emptyInvProd);

    }
    private static Entity retrieveInvProdByLookups() {
        if (invUid != Guid.Empty && prodUid != Guid.Empty) {
            QueryExpression query = new QueryExpression("cr76a_inventoryproduct");
            query.ColumnSet = new ColumnSet("cr76a_quantity");
            query.Criteria.AddCondition("cr76a_inventory",ConditionOperator.Equal,invUid);
            query.Criteria.AddCondition("cr76a_product", ConditionOperator.Equal, prodUid);

            EntityCollection results = service.RetrieveMultiple(query); //results is single inventory product(connector N:N)
            
            if (results.Entities.Count >= 1) {
                return results.Entities[0];
            }

        }
        return null;
    }
    private static Guid RetrieveRecordIdByName(string entityName, string fieldName, string fieldValue)
    {
        QueryExpression query = new QueryExpression(entityName);
        
        query.ColumnSet = new ColumnSet(); // Replace 'entityid' with your primary key
        query.Criteria.AddCondition(fieldName, ConditionOperator.Equal, fieldValue);

        EntityCollection results = service.RetrieveMultiple(query);

        if (results.Entities.Count >= 1)
        {
            return results.Entities[0].Id; // Return the ID of the entity
        }
        return Guid.Empty; // Return empty if not found
    }
}
