"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL, formatMoney, Icon } from "../../../components/ui";

function ExistingOrNew({ label, mode, onModeChange, children }) {
  return (
    <div className="form-section">
      <div className="form-section-head">
        <span>{label}</span>
        <div className="segmented-control">
          <button
            type="button"
            className={mode === "existing" ? "selected" : ""}
            onClick={() => onModeChange("existing")}
          >
            Có sẵn
          </button>
          <button
            type="button"
            className={mode === "new" ? "selected" : ""}
            onClick={() => onModeChange("new")}
          >
            Tạo mới
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldError({ children }) {
  return children ? <small className="field-error">{children}</small> : null;
}

function SearchablePicker({ items, value, onChange, type, error }) {
  const [search, setSearch] = useState("");
  const selected = items.find((item) => item.id === value);
  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    const text =
      type === "customer"
        ? `${item.clientCode || ""} ${item.name || ""} ${item.phone || ""} ${item.email || ""}`
        : `${item.sku || ""} ${item.name || ""} ${item.description || ""}`;
    return text.toLowerCase().includes(keyword);
  });

  if (selected) {
    return (
      <div className="picker-selected">
        <div>
          <strong>{type === "customer" ? selected.name : selected.name}</strong>
          <span>
            {type === "customer"
              ? `${selected.clientCode || ""} ${selected.phone || ""}`
              : `${selected.sku || ""} · ${formatMoney(selected.price)}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange("");
            setSearch("");
          }}
          aria-label="Bỏ lựa chọn"
        >
          <Icon name="x" size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="search-picker">
      <div className={`picker-input-wrap ${error ? "input-error" : ""}`}>
        <Icon name="search" size={16} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            type === "customer"
              ? "Tìm tên, mã hoặc số điện thoại..."
              : "Tìm tên, SKU sản phẩm..."
          }
        />
      </div>
      <div className="picker-list">
        {filteredItems.length === 0 ? (
          <div className="picker-empty">Không tìm thấy dữ liệu phù hợp.</div>
        ) : (
          filteredItems.map((item) => (
            <button
              type="button"
              className="picker-option"
              key={item.id}
              onClick={() => onChange(item.id)}
            >
              <span className="picker-option-icon">
                <Icon
                  name={type === "customer" ? "users" : "package"}
                  size={15}
                />
              </span>
              <span>
                <strong>{type === "customer" ? item.name : item.name}</strong>
                <small>
                  {type === "customer"
                    ? `${item.clientCode || "Chưa có mã"} · ${item.phone || "Chưa có SĐT"}`
                    : `${item.sku || "Chưa có SKU"} · ${formatMoney(item.price)}`}
                </small>
              </span>
            </button>
          ))
        )}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

export default function OrderModal({ order, onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [clientMode, setClientMode] = useState("existing");
  const [productMode, setProductMode] = useState("existing");
  const [clientId, setClientId] = useState(order?.clientId || "");
  const [productId, setProductId] = useState(
    order?.productId || order?.items?.[0]?.productId || "",
  );
  const [quantity, setQuantity] = useState(
    order?.quantity || order?.items?.[0]?.quantity || 1,
  );
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    unitPrice: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/customers`, { cache: "no-store" }),
      fetch(`${API_URL}/products`, { cache: "no-store" }),
    ])
      .then(async ([customerResponse, productResponse]) => {
        const [customerPayload, productPayload] = await Promise.all([
          customerResponse.json(),
          productResponse.json(),
        ]);
        if (!customerResponse.ok)
          throw new Error(
            customerPayload.message || "Không thể tải danh sách khách hàng.",
          );
        if (!productResponse.ok)
          throw new Error(
            productPayload.message || "Không thể tải danh sách sản phẩm.",
          );
        setCustomers(customerPayload.data || []);
        setProducts(productPayload.data || []);

        if (order) {
          const matchedClient = (customerPayload.data || []).find(
            (item) =>
              item.id === order.clientId ||
              item.clientCode === order.clientId ||
              item.name === order.customer,
          );
          const matchedProduct = (productPayload.data || []).find(
            (item) =>
              item.id === order.productId ||
              item.id === order.items?.[0]?.productId ||
              item.name === order.item,
          );
          if (matchedClient) setClientId(matchedClient.id);
          if (matchedProduct) setProductId(matchedProduct.id);
        }
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setCatalogLoading(false));
  }, [order]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId],
  );
  const unitPrice =
    productMode === "existing"
      ? Number(selectedProduct?.price || order?.unitPrice || 0)
      : Number(newProduct.unitPrice || 0);
  const total = unitPrice * Number(quantity || 0);

  function clearFieldError(field) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setClientModeAndClear(mode) {
    setClientMode(mode);
    clearFieldError("client");
  }

  function setProductModeAndClear(mode) {
    setProductMode(mode);
    clearFieldError("product");
  }

  function handleQuantityChange(event) {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setQuantity(digitsOnly);
    clearFieldError("quantity");
  }

  function preventInvalidQuantityKey(event) {
    if (["e", "E", "+", "-", ".", ","].includes(event.key))
      event.preventDefault();
  }

  function validateForm() {
    const nextErrors = {};

    if (clientMode === "existing" && !clientId)
      nextErrors.client = "Vui lòng chọn khách hàng.";
    if (clientMode === "new" && !newClient.name.trim())
      nextErrors.clientName = "Vui lòng nhập tên khách hàng.";
    if (
      clientMode === "new" &&
      newClient.email &&
      !/^\S+@\S+\.\S+$/.test(newClient.email)
    )
      nextErrors.clientEmail = "Email không đúng định dạng.";
    if (productMode === "existing" && !productId)
      nextErrors.product = "Vui lòng chọn sản phẩm.";
    if (productMode === "new" && !newProduct.name.trim())
      nextErrors.productName = "Vui lòng nhập tên sản phẩm.";
    if (productMode === "new" && !newProduct.sku.trim())
      nextErrors.productSku = "Vui lòng nhập SKU sản phẩm.";
    if (productMode === "new" && Number(newProduct.unitPrice) <= 0)
      nextErrors.productPrice = "Đơn giá phải lớn hơn 0.";
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
      nextErrors.quantity = "Số lượng phải là số nguyên lớn hơn 0.";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!validateForm()) return;

    const payload = {
      clientId: clientMode === "existing" ? clientId : null,
      ...(clientMode === "new" ? { newClient } : {}),
      items: [
        {
          productId: productMode === "existing" ? productId : null,
          ...(productMode === "new"
            ? {
                newProduct: {
                  name: newProduct.name.trim(),
                  sku: newProduct.sku.trim(),
                  unitPrice: Number(newProduct.unitPrice),
                },
              }
            : {}),
          quantity: Number(quantity),
        },
      ],
      action: "confirm",
    };

    setSaving(true);
    try {
      const response = await fetch(
        order ? `${API_URL}/orders/${order.id}` : `${API_URL}/orders`,
        {
          method: order ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Backend không thể xử lý đơn hàng.");
      onSaved(result.data);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal order-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              {order ? "CẬP NHẬT ĐƠN" : "TẠO ĐƠN MỚI"}
            </span>
            <h2>{order ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng">
            <Icon name="x" />
          </button>
        </div>

        {catalogLoading ? (
          <div className="modal-loading">
            Đang tải khách hàng và sản phẩm...
          </div>
        ) : (
          <form onSubmit={submit}>
            <ExistingOrNew
              label="Khách hàng"
              mode={clientMode}
              onModeChange={setClientModeAndClear}
            >
              {clientMode === "existing" ? (
                <SearchablePicker
                  items={customers}
                  value={clientId}
                  onChange={(value) => {
                    setClientId(value);
                    clearFieldError("client");
                  }}
                  type="customer"
                  error={fieldErrors.client}
                />
              ) : (
                <div className="mini-form-grid">
                  <div className="field-control">
                    <input
                      value={newClient.name}
                      onChange={(event) => {
                        setNewClient({
                          ...newClient,
                          name: event.target.value,
                        });
                        clearFieldError("clientName");
                      }}
                      placeholder="Tên khách hàng *"
                      className={fieldErrors.clientName ? "input-error" : ""}
                    />
                    <FieldError>{fieldErrors.clientName}</FieldError>
                  </div>
                  <div className="field-control">
                    <input
                      value={newClient.phone}
                      onChange={(event) =>
                        setNewClient({
                          ...newClient,
                          phone: event.target.value,
                        })
                      }
                      placeholder="Số điện thoại"
                    />
                  </div>
                  <div className="field-control">
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(event) => {
                        setNewClient({
                          ...newClient,
                          email: event.target.value,
                        });
                        clearFieldError("clientEmail");
                      }}
                      placeholder="Email"
                      className={fieldErrors.clientEmail ? "input-error" : ""}
                    />
                    <FieldError>{fieldErrors.clientEmail}</FieldError>
                  </div>
                  <div className="field-control">
                    <input
                      value={newClient.address}
                      onChange={(event) =>
                        setNewClient({
                          ...newClient,
                          address: event.target.value,
                        })
                      }
                      placeholder="Địa chỉ"
                    />
                  </div>
                </div>
              )}
            </ExistingOrNew>

            <ExistingOrNew
              label="Sản phẩm"
              mode={productMode}
              onModeChange={setProductModeAndClear}
            >
              {productMode === "existing" ? (
                <SearchablePicker
                  items={products}
                  value={productId}
                  onChange={(value) => {
                    setProductId(value);
                    clearFieldError("product");
                  }}
                  type="product"
                  error={fieldErrors.product}
                />
              ) : (
                <div className="mini-form-grid">
                  <div className="field-control">
                    <input
                      value={newProduct.name}
                      onChange={(event) => {
                        setNewProduct({
                          ...newProduct,
                          name: event.target.value,
                        });
                        clearFieldError("productName");
                      }}
                      placeholder="Tên sản phẩm *"
                      className={fieldErrors.productName ? "input-error" : ""}
                    />
                    <FieldError>{fieldErrors.productName}</FieldError>
                  </div>
                  <div className="field-control">
                    <input
                      value={newProduct.sku}
                      onChange={(event) => {
                        setNewProduct({
                          ...newProduct,
                          sku: event.target.value,
                        });
                        clearFieldError("productSku");
                      }}
                      placeholder="SKU *"
                      className={fieldErrors.productSku ? "input-error" : ""}
                    />
                    <FieldError>{fieldErrors.productSku}</FieldError>
                  </div>
                  <div className="field-control">
                    <input
                      type="number"
                      min="1"
                      value={newProduct.unitPrice}
                      onChange={(event) => {
                        setNewProduct({
                          ...newProduct,
                          unitPrice: event.target.value,
                        });
                        clearFieldError("productPrice");
                      }}
                      placeholder="Đơn giá *"
                      className={fieldErrors.productPrice ? "input-error" : ""}
                    />
                    <FieldError>{fieldErrors.productPrice}</FieldError>
                  </div>
                </div>
              )}
            </ExistingOrNew>

            <div className="field order-quantity-field">
              <label htmlFor="order-quantity">Số lượng</label>
              <input
                id="order-quantity"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={quantity}
                onKeyDown={preventInvalidQuantityKey}
                onChange={handleQuantityChange}
                className={fieldErrors.quantity ? "input-error" : ""}
              />
              <FieldError>{fieldErrors.quantity}</FieldError>
            </div>

            <div className="total-preview">
              <span>Thành tiền dự kiến</span>
              <strong>{formatMoney(total)}</strong>
              <small>Backend tự xử lý và tính lại</small>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button className="button button-primary" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"} <Icon name="arrow" size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
