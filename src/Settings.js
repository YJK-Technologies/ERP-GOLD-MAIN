import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import AppContent from './App_content';
import ForgotPopup from "./Forgotpopup";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';

const config = require('./Apiconfig');

const SettingsPage = () => {
  // Example state for settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [perioddrop, setPerioddrop] = useState([]);
  const [selectedOption, setSelectedOption] = useState('')

  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState('');
  const [salesPeriod, setSalesPeriod] = useState("");
  const [selectedPurchasePeriod, setSelectedPurchasePeriod] = useState('');
  const [purchasePeriod, setPurchasePeriod] = useState("");
  const [selectedItemsPeriod, setSelectedItemsPeriod] = useState('');
  const [itemsPeriod, setItemsPeriod] = useState('');
  const [selectedStockValuesPeriod, setSelectedStockValuesPeriod] = useState('');
  const [stockValuesPeriod, setStockValuesPeriod] = useState('');

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDateRange`)
      .then((data) => data.json())
      .then((val) => {
        setPerioddrop(val);

        const availableOptions = val.filter(
          (option) => Number(option.Sno) !== 8
        );

        if (availableOptions.length > 0) {
          const firstOption = {
            value: availableOptions[0].Sno,
            label: availableOptions[0].DateRangeDescription,
          };

          setSelectedPurchasePeriod(firstOption);
          setSelectedSalesPeriod(firstOption);
          setSelectedItemsPeriod(firstOption);
          setSelectedStockValuesPeriod(firstOption);

          setPurchasePeriod(firstOption.value);
          setSalesPeriod(firstOption.value);
          setItemsPeriod(firstOption.value);
          setStockValuesPeriod(firstOption.value);
        }
      })
      .catch((error) => {
        console.error("Error fetching date range:", error);
      });
  }, []);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");
        const userCode = sessionStorage.getItem("selectedUserCode");

        if (!companyCode || !userCode) {
          console.warn("Company code or user code not found in sessionStorage");
          return;
        }

        const response = await fetch(`${config.apiBaseUrl}/getSettings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            company_code: companyCode,
            user_code: userCode
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || result || "Failed to fetch settings"
          );
        }

        if (result && result.length > 0) {
          const settings = result[0];

          console.log("Settings Data:", settings);

          // Dashboard Sales
          const salesOption = filteredOptionPeriod.find(
            (option) =>
              Number(option.value) === Number(settings.dashboard_sales)
          );

          // Dashboard Purchase
          const purchaseOption = filteredOptionPeriod.find(
            (option) =>
              Number(option.value) === Number(settings.dashboard_purchase)
          );

          // Dashboard Items
          const itemsOption = filteredOptionPeriod.find(
            (option) =>
              Number(option.value) === Number(settings.dashboard_item)
          );

          // Dashboard Stock Values
          const stockValuesOption = filteredOptionPeriod.find(
            (option) =>
              Number(option.value) === Number(settings.dashboard_stockvalue)
          );

          if (salesOption) {
            setSelectedSalesPeriod(salesOption);
            setSalesPeriod(salesOption.value);
          }

          if (purchaseOption) {
            setSelectedPurchasePeriod(purchaseOption);
            setPurchasePeriod(purchaseOption.value);
          }

          if (itemsOption) {
            setSelectedItemsPeriod(itemsOption);
            setItemsPeriod(itemsOption.value);
          }

          if (stockValuesOption) {
            setSelectedStockValuesPeriod(stockValuesOption);
            setStockValuesPeriod(stockValuesOption.value);
          }

        }

      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    getSettings();
  }, [perioddrop]);

  const handleSalesPeriodChange = (selectedOption) => {
    setSelectedSalesPeriod(selectedOption);
    setSalesPeriod(selectedOption ? selectedOption.value : '');
  };

  const handlePurchasePeriodChange = (selectedOption) => {
    setSelectedPurchasePeriod(selectedOption);
    setPurchasePeriod(selectedOption ? selectedOption.value : '');
  };

  const handleItemsPeriodChange = (selectedOption) => {
    setSelectedItemsPeriod(selectedOption);
    setItemsPeriod(selectedOption ? selectedOption.value : '');
  };

  const handleStockValuesPeriodChange = (selectedOption) => {
    setSelectedStockValuesPeriod(selectedOption);
    setStockValuesPeriod(selectedOption ? selectedOption.value : '');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const filteredOptionPeriod = perioddrop
    .filter((option) => Number(option.Sno) !== 8)
    .map((option) => ({
      value: option.Sno,
      label: option.DateRangeDescription,
    }));

  const options = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' }
  ];

  const handleSaveSettings = async () => {
    try {
      const payload = {
        DashboardSales: salesPeriod.toString() || "",
        DashboardPurchase: purchasePeriod.toString() || "",
        DashboardItem: itemsPeriod.toString() || "",
        DashboardStockValue: stockValuesPeriod.toString() || "",
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        user_code: sessionStorage.getItem("selectedUserCode"),
        created_by: sessionStorage.getItem("selectedUserCode"),
        modified_by: sessionStorage.getItem("selectedUserCode")
      };

      const response = await fetch(`${config.apiBaseUrl}/insertSettings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save settings");
      }

      toast.success("Settings saved successfully.");

    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div align="right">
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 className="purbut">Settings</h1>
            </div>
            <div className="d-flex justify-content-end me-5 purbut">
              <button className="btn btn-success mt-2 mb-2 purbut" onClick={handleSaveSettings} style={{ cursor: "pointer" }} title="Save settings">
                Save
              </button>
              <button className="btn btn-primary mt-2 mb-2  purbut" onClick={handleOpen} style={{ cursor: "pointer" }} title="reset password">
                Reset password
              </button>
            </div>
          </div>

          <div className="mobileview">
            <div className="d-flex justify-content-between">
              <div className="d-flex justify-content-start">
                <h1 className=""> Settings</h1>
              </div>
              <div className="d-flex justify-content-end ms-0">
                <div className="dropdown mt-2 me-5 ms-3" style={{ paddingLeft: 0 }}>
                  <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fa-solid fa-list"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <icon className="icon text-dark text-center fs-1" onClick={handleOpen} title="reset password">
                      <i className="fa-solid fa-lock-open"></i>
                    </icon>
                    <icon className="icon text-success text-center fs-1" title="save">
                      <i class="fa-solid fa-floppy-disk"></i>
                    </icon>
                  </ul>
                </div>
                <ForgotPopup open={open} handleClose={handleClose} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="row mt-4 p-2 ms-4">

          <div className="col-12 col-md-2 mb-3 me-5 mt-4"> <label className="fw-bold fs-5">General: </label><br></br>
            <label htmlFor="language" className="form-label me-2 mt-1">Language:</label>
            <Select
              className="exp-input-field"
              options={options}
              value={selectedOption}
              onChange={setSelectedOption}
            />
          </div>

          <div className="col-md-4 mt-4">
            <label className="fw-bold fs-5">Dashboard Settings: </label>

            <div className="row">
              <div className="col-12 col-md-8 mb-3">
                <label htmlFor="total-sales" className="form-label me-2">Total Sales:</label>
                <Select
                  id="total-sales"
                  value={selectedSalesPeriod}
                  onChange={handleSalesPeriodChange}
                  options={filteredOptionPeriod}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>

              <div className="col-12 col-md-8 mb-3">
                <label htmlFor="total-purchase" className="form-label me-2">
                  Total Purchase:
                </label>

                <Select
                  id="total-purchase"
                  value={selectedPurchasePeriod}
                  onChange={handlePurchasePeriodChange}
                  options={filteredOptionPeriod}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>

              <div className="col-12 col-md-8 mb-3">
                <label htmlFor="total-items" className="form-label me-2">
                  Total Items:
                </label>

                <Select
                  id="total-items"
                  value={selectedItemsPeriod}
                  onChange={handleItemsPeriodChange}
                  options={filteredOptionPeriod}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>

              <div className="col-12 col-md-8 mb-3">
                <label htmlFor="total-stock-values" className="form-label me-2">
                  Total Stock Values:
                </label>

                <Select
                  id="total-stock-values"
                  value={selectedStockValuesPeriod}
                  onChange={handleStockValuesPeriodChange}
                  options={filteredOptionPeriod}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>
            </div>

          </div>
          <div className='col-md-4 mt-4'>
            <div className="col-md-10">
              <div className="col-12 col-md-6">
                <label htmlFor="theme" className="fw-bold fs-5">Theme:</label>
                <div className='mt-4'>
                  <ThemeProvider>
                    <AppContent />
                  </ThemeProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default SettingsPage;
