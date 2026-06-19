import React, { useState,useEffect} from 'react';

import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";  
  import LoadingScreen from './Loading'; 


const config = require('./Apiconfig');

const InvoiceSettings = () => {
    // Example state for settings

  const [selectedPay, setSelectedPay] = useState(null);
  const [payType, setPayType] = useState("");
  const [paydrop, setPaydrop] = useState([]);
  const [selectedSales, setSelectedSales] = useState(null);
  const [salesdrop, setSalesdrop] = useState([]);
  const [salesType, setSalesType] = useState("");
  const [error, setError] = useState("");
  const [Type, setType] = useState("TaxInvoice");
    const [loading, setLoading] = useState(false);  
   const navigate = useNavigate();


  

 

  const handleChangePay = (selectedOption) => {
    setSelectedPay(selectedOption);
    setPayType(selectedOption ? selectedOption.value : '');
  };
  
  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {

     fetch(`${config.apiBaseUrl}/paytype`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  company_code: sessionStorage.getItem("selectedCompanyCode"),
          
                }),
              })

      .then((response) => response.json())
      .then((data) => setPaydrop(data))
      .catch((error) => console.error("Error fetching payment types:", error));

      fetch(`${config.apiBaseUrl}/salestype`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
  
        }),
      })

      .then((response) => response.json())
      .then((data) => setSalesdrop(data))
      .catch((error) => console.error("Error fetching sales types:", error));


    }, []);


    const handleChangeSales = (selectedOption) => {
      setSelectedSales(selectedOption);
      setSalesType(selectedOption ? selectedOption.value : '');
    
    };
    const filteredOptionSales = salesdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }));

    


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type:Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;
  
        const { pay_type,Transaction_type } = data[0];
  
        const setDefault = (type, setType, options, setSelected) => {
          if (type) {
            setType(type);
            setSelected(options.find((opt) => opt.value === type) || null);
          }
        };
  
        setDefault(pay_type, setPayType, filteredOptionPay, setSelectedPay);
        setDefault(Transaction_type, setSalesType, filteredOptionSales, setSelectedSales);
        
  
 
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [paydrop,salesdrop]);



  const handleSaveButtonClick = async () => {
 if (  !payType  || !salesType) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true);
    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        pay_type: payType,
        Transaction_type: salesType,
        Screen_Type:Type,
        created_by: sessionStorage.getItem('selectedUserCode')
      };
      const response = await fetch(`${config.apiBaseUrl}/AddTransactionSettinngs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
    
      if (response.ok) {
        toast.success("Sales Data inserted Successfully");
      } else {
        const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
          console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    }finally {
      setLoading(false);
    }

  };


  const handleNavigate = () => {
    navigate("/TaxInvoice"); // Pass selectedRows as props to the Input component
  };

    return (
<div className="container-fluid Topnav-screen">
<ToastContainer position="top-right" className="toast-design" theme="colored"/>
      {loading && <LoadingScreen />}
<div className="shadow-lg p-0 bg-body-tertiary rounded  ">
<div className=" mb-0 d-flex justify-content-between" >
        <label className="fw-bold fs-5">Default  Settings: </label>
        <button onClick={handleNavigate} className=" btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
              <i class="fa-solid fa-xmark"></i>
              </button>
        </div>
        </div>

        <div class="pt-2 mb-4">  
        <div className="shadow-lg p-3 bg-body-tertiary rounded  mb-2">
        <div className="row  ms-3 me-3">
  
        <div className="col-md-3 form-group mb-2 ">
                  <div className="exp-form-floating">
                    <label htmlFor="" className={`${error && !payType ? 'red' : ''}`}>Pay type</label>
                    <span className="text-danger">*</span>
                    <Select
                      id="payType"
                      value={selectedPay}
                      onChange={handleChangePay}
                      options={filteredOptionPay}
                      className="exp-input-field"
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" className={`${error && !salesType ? 'red' : ''}`}>
                      
                      Sales type</label>
                      <span className="text-danger">*</span>

                    <Select
                      id="salesType"
                      value={selectedSales}
                      onChange={handleChangeSales}
                      options={filteredOptionSales}
                      className="exp-input-field"
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                      autoComplete="off"
                   
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2" style={{ display: "none" }}>
  <div className="exp-form-floating">
    <label id="customer">Screen Type</label>
    <input
      className="exp-input-field form-control"
      id="customername"
      required
      value={Type}
      onChange={(e) => setType(e.target.value)}
    />
  </div>
</div>

                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                  <button className="" onClick={handleSaveButtonClick} title="Save">
                    Save
                  </button>
                </div>
          </div>
         </div>
</div>
      </div>
   


    );
};

export default InvoiceSettings;
