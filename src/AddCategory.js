// AddCategory.js
import React, { useState, useEffect, useRef } from "react";
import "./input.css";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

function AddCategoryScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode = "create", selectedData = {}, Keyfield: routeKeyfield } = location.state || {};
  const company_code = sessionStorage.getItem("selectedCompanyCode");

  // Form Field States
  const [Item_Category_Code, setItem_Category_Code] = useState(selectedData.Item_Category_Code || "");
  const [Item_Category_Name, setItem_Category_Name] = useState(selectedData.Item_Category_Name || "");
  const [Region_Code, setRegion_Code] = useState(selectedData.Region_Code || "");
  const [Country_Code, setCountry_Code] = useState(selectedData.Country_Code || "");
  const [Item_Category_Description, setItem_Category_Description] = useState(selectedData.Item_Category_Description || "");
  const [Is_Default, setIs_Default] = useState(
    selectedData.Is_Default === true || selectedData.Is_Default === 1 || selectedData.Is_Default === "1"
  );
  const [Display_Order, setDisplay_Order] = useState(selectedData.Display_Order || 0);
  const [Record_Version, setRecord_Version] = useState(selectedData.Record_Version || 0);
  const [Item_Category_Image, setItem_Category_Image] = useState(null);
  const [status, setStatus] = useState(selectedData.Is_Active || "");
  const [keyfield, setKeyfield] = useState(routeKeyfield || selectedData.Keyfield || "");

  // Selected Option States for react-select
  const [selectedStatus, setSelectedStatus] = useState(
    selectedData.Is_Active ? { label: selectedData.Is_Active, value: selectedData.Is_Active } : null
  );
  const [selectedImage, setSelectedImage] = useState(null);

  // Dropdown Data States
  const [statusdrop, setStatusdrop] = useState([]);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for Enter-Key Navigation Flow
  const RefCode = useRef(null);
  const RefName = useRef(null);
  const RefRegion = useRef(null);
  const RefCountry = useRef(null);
  const RefStatus = useRef(null);
  const RefDisplayOrder = useRef(null);
  const RefVersion = useRef(null);
  const RefDesc = useRef(null);
  const RefImg = useRef(null);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error("Error fetching status:", error));
  }, [company_code]);

  // Filtered Options mapping (without "All" option to prevent invalid DB inserts)
  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions || option.attributedetails_name,
  }));

  // Default to "Active" in create mode once status options load
  useEffect(() => {
    if (mode === "create" && statusdrop.length > 0 && !status) {
      const defaultStatus = statusdrop.find(
        (item) => item.attributedetails_name === "Active"
      );
      if (defaultStatus) {
        const defaultOption = {
          value: defaultStatus.attributedetails_name,
          label: defaultStatus.descriptions || defaultStatus.attributedetails_name,
        };
        setSelectedStatus(defaultOption);
        setStatus(defaultOption.value);
      }
    }
  }, [mode, statusdrop]);

  // Fetch full record details in update mode
  useEffect(() => {
    if (mode === "update" && routeKeyfield && statusdrop.length > 0) {
      fetchCategoryData();
    }
  }, [mode, routeKeyfield, statusdrop]);

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToFile = (base64Data, fileName) => {
    const parts = base64Data.split(",");
    const mime = parts[0].match(/:(.*?);/);
    const binaryString = atob(parts[1]);
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const fileBlob = new Blob([uint8Array], { type: mime[1] });
    return new File([fileBlob], fileName, { type: mime[1] });
  };

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getCategoryData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Keyfield: routeKeyfield,
          company_code,
        }),
      });

      const data = await response.json();

      if (response.ok && data.length > 0) {
        const category = data[0];

        setItem_Category_Code(category.Item_Category_Code || "");
        setItem_Category_Name(category.Item_Category_Name || "");
        setItem_Category_Description(category.Item_Category_Description || "");
        setRecord_Version(category.Record_Version || 0);
        setDisplay_Order(category.Display_Order || 0);
        setKeyfield(category.Keyfield || "");
        setRegion_Code(category.Region_Code || "");
        setCountry_Code(category.Country_Code || "");

        const isDefaultBit =
          category.Is_Default === true ||
          category.Is_Default === 1 ||
          category.Is_Default === "1";
        setIs_Default(isDefaultBit);

        const isActiveBit =
          category.Is_Active === true ||
          category.Is_Active === 1 ||
          category.Is_Active === "1" ||
          category.Is_Active === "Active";

        const targetStatusValue = isActiveBit ? "Active" : "Close";
        const statusOption = filteredOptionStatus.find(
          (opt) => opt.value === targetStatusValue
        ) || { value: targetStatusValue, label: targetStatusValue };

        setSelectedStatus(statusOption);
        setStatus(statusOption.value);

        if (category.Item_Category_Image && category.Item_Category_Image.data) {
          const base64Image = arrayBufferToBase64(category.Item_Category_Image.data);
          const dataUrl = `data:image/jpeg;base64,${base64Image}`;
          const file = base64ToFile(dataUrl, "Item_Category_Image.jpg");
          setSelectedImage(dataUrl);
          setItem_Category_Image(file);
        } else {
          setSelectedImage(null);
          setItem_Category_Image(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch category details");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    setStatus(selected ? selected.value : "");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds 1MB. Please upload a smaller file.");
        event.target.value = null;
        return;
      }
      setSelectedImage(URL.createObjectURL(file));
      setItem_Category_Image(file);
    }
  };

  const handleKeyDown = (e, nextFieldRef, currentValue) => {
    if (e.key === "Enter") {
      if (currentValue || currentValue === false || currentValue === 0) {
        if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
        }
      } else {
        e.preventDefault();
      }
    }
  };

  const handleNavigate = () => {
    navigate("/Category", {
      state: {
        refreshGrid: true,
        preservedInputs: location.state?.preservedInputs,
      },
    });
  };

  const handleSave = async () => {
    if (!Item_Category_Code || !Item_Category_Name || !status) {
      setError(true);
      toast.warning("Error: Missing required fields (Code, Name, Status)");
      return;
    }

    setError(false);
    setLoading(true);
    const endpoint =
      mode === "create"
        ? "Item_Category_MasterInsert"
        : "Item_Category_MasterUpdate";

    try {
      const formData = new FormData();
      formData.append("company_code", sessionStorage.getItem("selectedCompanyCode"));
      formData.append("location_code", sessionStorage.getItem("selectedLocationCode"));
      formData.append("Item_Category_Code", Item_Category_Code);
      formData.append("Item_Category_Name", Item_Category_Name);
      formData.append("Item_Category_Description", Item_Category_Description);
      formData.append("Region_Code", Region_Code);
      formData.append("Country_Code", Country_Code);
      formData.append("Display_Order", Display_Order);
      formData.append("Record_Version", Record_Version);
      formData.append("Is_Active", status === "Active" ? 1 : 0);
      formData.append("Is_Default", Is_Default ? 1 : 0);

      if (mode === "create") {
        formData.append("created_by", sessionStorage.getItem("selectedUserCode"));
      } else {
        formData.append("Keyfield", keyfield);
        formData.append("created_by", sessionStorage.getItem("selectedUserCode"));
        formData.append("modified_by", sessionStorage.getItem("selectedUserCode"));
      }

      if (Item_Category_Image) {
        formData.append("Item_Category_Image", Item_Category_Image);
      }

      const response = await fetch(`${config.apiBaseUrl}/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success(
          `Data ${mode === "create" ? "inserted" : "updated"} successfully!`,
        );
      } else {
        const errorResponse = await response.json();
        toast.error(errorResponse.message || "Failed to process data");
      }
    } catch (error) {
      toast.error("Error saving data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />

      {/* Desktop View */}
      <div className="purbut">
        <div>
          {/* Header Layout */}
          <div className="shadow-lg p-0 bg-body-tertiary rounded mb-2">
            <div className="purbut mb-0 d-flex justify-content-between">
              <h1 align="left" className="purbut">
                {mode === "update" ? "Update Category" : "Add Category"}
              </h1>
              <button
                onClick={handleNavigate}
                className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5"
                required
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Form Layout */}
          <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
            <div className="row">
              {/* Category Code */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label
                        className={`exp-form-labels ${
                          error && !Item_Category_Code ? "text-danger" : ""
                        }`}
                      >
                        Category Code<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Category Code"
                    value={Item_Category_Code}
                    onChange={(e) => setItem_Category_Code(e.target.value)}
                    readOnly={mode === "update"}
                    maxLength={40}
                    ref={RefCode}
                    onKeyDown={(e) => handleKeyDown(e, RefName, Item_Category_Code)}
                  />
                </div>
              </div>

              {/* Category Name */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label
                        className={`exp-form-labels ${
                          error && !Item_Category_Name ? "text-danger" : ""
                        }`}
                      >
                        Category Name<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Category Name"
                    value={Item_Category_Name}
                    onChange={(e) => setItem_Category_Name(e.target.value)}
                    maxLength={40}
                    ref={RefName}
                    onKeyDown={(e) => handleKeyDown(e, RefRegion, Item_Category_Name)}
                  />
                </div>
              </div>

              {/* Region Code */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Region Code</label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    title="Region Code"
                    value={Region_Code}
                    onChange={(e) => setRegion_Code(e.target.value)}
                    maxLength={60}
                    ref={RefRegion}
                    onKeyDown={(e) => handleKeyDown(e, RefCountry, Region_Code)}
                  />
                </div>
              </div>

              {/* Country Code */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Country Code</label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    title="Country Code"
                    value={Country_Code}
                    onChange={(e) => setCountry_Code(e.target.value)}
                    maxLength={50}
                    ref={RefCountry}
                    onKeyDown={(e) => handleKeyDown(e, RefStatus, Country_Code)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label
                        className={`exp-form-labels ${
                          error && !status ? "text-danger" : ""
                        }`}
                      >
                        Status<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div title="Select the Status">
                    <Select
                      id="status"
                      value={selectedStatus}
                      onChange={handleChangeStatus}
                      onKeyDown={(e) => handleKeyDown(e, RefDisplayOrder, status)}
                      options={filteredOptionStatus}
                      className="exp-input-field"
                      placeholder=""
                      isClearable
                      classNamePrefix="react-select"
                      ref={RefStatus}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              {/* Display Order */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Display Order</label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="number"
                    placeholder=""
                    title="Display Order"
                    value={Display_Order}
                    onChange={(e) => setDisplay_Order(e.target.value)}
                    maxLength={20}
                    ref={RefDisplayOrder}
                    onKeyDown={(e) => handleKeyDown(e, RefVersion, Display_Order)}
                  />
                </div>
              </div>

              {/* Record Version */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Record Version</label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="number"
                    placeholder=""
                    title="Record Version"
                    value={Record_Version}
                    onChange={(e) => setRecord_Version(e.target.value)}
                    maxLength={20}
                    ref={RefVersion}
                    onKeyDown={(e) => handleKeyDown(e, RefDesc, Record_Version)}
                  />
                </div>
              </div>

              {/* Default Display Switch */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Default Display</label>
                    </div>
                  </div>
                  <div
                    className="form-check form-switch pt-2 d-flex ms-3"
                    title="Is Default Display?"
                  >
                    <input
                      className="form-check-input fs-4"
                      type="checkbox"
                      role="switch"
                      checked={Is_Default}
                      onChange={(e) => setIs_Default(e.target.checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="col-md-6 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Description</label>
                    </div>
                  </div>
                  <textarea
                    className="exp-input-field form-control"
                    placeholder=""
                    rows={3}
                    title="Description"
                    value={Item_Category_Description || ""}
                    onChange={(e) => setItem_Category_Description(e.target.value)}
                    maxLength={250}
                    ref={RefDesc}
                  />
                </div>
              </div>

              {/* Category Image Upload */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Category Image</label>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="exp-input-field form-control"
                    accept="image/*"
                    title="Category Image"
                    onChange={handleFileSelect}
                    ref={RefImg}
                  />
                </div>
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <img
                      src={selectedImage}
                      alt="Selected Preview"
                      className="avatar rounded sm mt-2"
                      style={{ height: "120px", width: "120px", objectFit: "cover" }}
                    />
                  </div>
                </div>
              )}

              {/* Save / Update Button */}
              <div className="col-md-3 form-group mt-4">
                <button
                  onClick={handleSave}
                  className=""
                  required
                  title={mode === "update" ? "Update" : "Save"}
                >
                  {mode === "update" ? (
                    <i className="fa-solid fa-pen-to-square"></i>
                  ) : (
                    <i className="fa-solid fa-floppy-disk"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Structure */}
      <div className="mobileview">
        <div>
          <div className="shadow-lg p-0 bg-body-tertiary rounded mb-2">
            <div className="mb-0 d-flex justify-content-between">
              <h1 align="left" className="h1">
                {mode === "update" ? "Update Category" : "Add Category"}
              </h1>
              <button
                onClick={handleNavigate}
                className="btn btn-danger shadow-none borde-shape h-70 fs-5"
                required
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
            <div className="row">
              <div className="col-md-12 form-group mt-2">
                <p className="text-center text-muted">
                  Use standard responsive views or duplicate inputs here as needed per AccountNameInput reference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCategoryScreen;