import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";  
import LoadingScreen from './Loading'; 

const config = require('./Apiconfig');

const InvoiceSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedPay, setSelectedPay] = useState(null);
  const [payType, setPayType] = useState("");
  const [paydrop, setPaydrop] = useState([]);
  
  const [selectedSales, setSelectedSales] = useState(null);
  const [salesdrop, setSalesdrop] = useState([]);
  const [salesType, setSalesType] = useState("");
  
  const [error, setError] = useState("");
  // Get screen type dynamically passed from TaxInvoice or default to TaxInvoice
  const [Type, setType] = useState(location.state?.type || "TaxInvoice");
  const [loading, setLoading] = useState(false);  

  // Print & Template states (based on PurchaseSetting)
  const [selectedPrint, setselectedPrint] = useState(null);
  const [printdrop, setprintdrop] = useState([]);
  const [selectedCopies, setselectedCopies] = useState(null);
  const [copiesdrop, setcopiesdrop] = useState([]);
  const [Print, setPrint] = useState(null);
  const [Copies, setCopies] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [PrintTemplate, setPrintTemplate] = useState([]);

  const handleChangePay = (selectedOption) => {
    setSelectedPay(selectedOption);
    setPayType(selectedOption ? selectedOption.value : '');
  };
  
  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeSales = (selectedOption) => {
    setSelectedSales(selectedOption);
    setSalesType(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionSales = salesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangePrint = (selectedOption) => {
    setselectedPrint(selectedOption);
    setPrint(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionPrint = Array.isArray(printdrop) ? printdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  })) : [];

  const handleChangeCopies = (selectedOption) => {
    setselectedCopies(selectedOption);
    setCopies(selectedOption ? selectedOption.value : '');
  };

  const filteredOptionCopies = Array.isArray(copiesdrop) ? copiesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  })) : [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? PrintTemplate.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === PrintTemplate.length - 1 ? 0 : prev + 1));
  };

  // Fetch dropdown lists on mount
  useEffect(() => {
    const companyCode = sessionStorage.getItem("selectedCompanyCode");

    fetch(`${config.apiBaseUrl}/paytype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code: companyCode }),
    })
      .then((response) => response.json())
      .then((data) => setPaydrop(data))
      .catch((error) => console.error("Error fetching payment types:", error));

    fetch(`${config.apiBaseUrl}/salestype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code: companyCode }),
    })
      .then((response) => response.json())
      .then((data) => setSalesdrop(data))
      .catch((error) => console.error("Error fetching sales types:", error));

    fetch(`${config.apiBaseUrl}/getPrint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_code: companyCode }),
    })
      .then((response) => response.json())
      .then(setprintdrop)
      .catch((error) => console.error("Error fetching print options:", error));

    fetch(`${config.apiBaseUrl}/getcopies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_code: companyCode }),
    })
      .then((response) => response.json())
      .then(setcopiesdrop)
      .catch((error) => console.error("Error fetching copies:", error));

  }, []);

  // Fetch Print Templates based on Screen Type
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/PrintTemplates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Screen_Type: Type }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const templates = data.map((item) => {
            const byteArray = new Uint8Array(item.Templates.data);
            const blob = new Blob([byteArray], { type: "image/png" });
            const imageUrl = URL.createObjectURL(blob);
            return {
              keyfield: item.Key_field,
              image: imageUrl,
            };
          });
          setPrintTemplate(templates);
        }
      })
      .catch((error) => console.error("Error fetching print templates:", error));
  }, [Type]);

  // Fetch Default Options configuration
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;
  
        const { pay_type, Transaction_type, Print_copies, Print_options, Print_templates } = data[0];
  
        const setDefault = (type, setType, options, setSelected) => {
          if (type !== undefined && type !== null) {
            const typeStr = type.toString();
            setType(typeStr);
            setSelected(options.find((opt) => opt.value === typeStr) || null);
          }
        };
  
        setDefault(pay_type, setPayType, filteredOptionPay, setSelectedPay);
        setDefault(Transaction_type, setSalesType, filteredOptionSales, setSelectedSales);
        setDefault(Print_options, setPrint, filteredOptionPrint, setselectedPrint);
        setDefault(Print_copies, setCopies, filteredOptionCopies, setselectedCopies);

        if (Print_templates && PrintTemplate.length > 0) {
          const matchingIndex = PrintTemplate.findIndex(t => t.keyfield === Print_templates);
          if (matchingIndex !== -1) {
            setCurrentIndex(matchingIndex);
          }
        }
      })
      .catch((error) => console.error("Error fetching default options data:", error));
  }, [paydrop, salesdrop, copiesdrop, printdrop, Type, PrintTemplate]);

  const handleSaveButtonClick = async () => {
    if (!payType || !salesType) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true);
    try {
      const selectedTemplate = PrintTemplate[currentIndex];
      const selectedKeyField = selectedTemplate ? selectedTemplate.keyfield : "";

      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        pay_type: payType,
        Transaction_type: salesType,
        Screen_Type: Type,
        Print_options: Print,
        Print_copies: Copies,
        Print_templates: selectedKeyField,
        created_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/AddTransactionSettinngs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Header),
      });
    
      if (response.ok) {
        toast.success("Sales Settings saved successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to save sales settings");
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate("/TaxInvoice");
  };

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored"/>
      {loading && <LoadingScreen />}
      <div className="shadow-lg p-0 bg-body-tertiary rounded">
        <div className="mb-0 d-flex justify-content-between">
          <label className="fw-bold fs-5">Default Settings: </label>
          <button onClick={handleNavigate} className="btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div className="pt-2 mb-4">  
        <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
          <div className="row ms-3 me-3">
  
            <div className="col-md-3 form-group mb-2">
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
                <label htmlFor="" className={`${error && !salesType ? 'red' : ''}`}>Sales type</label>
                <span className="text-danger">*</span>
                <Select
                  id="salesType"
                  value={selectedSales}
                  onChange={handleChangeSales}
                  options={filteredOptionSales}
                  className="exp-input-field"
                  placeholder=""
                  required
                  data-tip="Please select a sales type"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label>Print Options</label>
                <Select
                  className="exp-input-field"
                  id="printOptions"
                  placeholder=""
                  required
                  value={selectedPrint}
                  onChange={handleChangePrint}
                  options={filteredOptionPrint}
                  data-tip="Please select a print option"
                />
              </div>
            </div>

            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label>Print Copies</label>
                <Select
                  className="exp-input-field"
                  id="printCopies"
                  placeholder=""
                  required
                  value={selectedCopies}
                  onChange={handleChangeCopies}
                  options={filteredOptionCopies}
                  data-tip="Please select print copies"
                />
              </div>
            </div>

            {/* Template Carousel Preview UI */}
            <div className="col-md-3 d-flex flex-column justify-content-between align-items-center h-100">
              <div className="position-relative d-flex justify-content-center my-4">
                <button
                  className="nav-arrow btn btn-light rounded-1 position-absolute start-0 top-50 translate-middle-y"
                  onClick={handlePrev}
                  disabled={PrintTemplate.length === 0}
                >
                  ❮
                </button>

                <div className="template-preview-box border rounded shadow-sm py-2">
                  {PrintTemplate.length > 0 ? (
                    <img
                      src={PrintTemplate[currentIndex].image}
                      alt="Template Preview"
                      className="preview-image"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  ) : (
                    <div className="placeholder-text text-muted p-3">No Preview Available</div>
                  )}
                </div>

                <button
                  className="nav-arrow btn btn-light rounded-1 position-absolute end-0 top-50 translate-middle-y"
                  onClick={handleNext}
                  disabled={PrintTemplate.length === 0}
                >
                  ❯
                </button>
              </div>

              <div className="mt-auto text-center small text-muted mb-2">
                Template {PrintTemplate.length > 0 ? currentIndex + 1 : 0} of {PrintTemplate.length}
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

            <div className="col-md-3 form-group d-flex align-items-end mt-4 mb-4">
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