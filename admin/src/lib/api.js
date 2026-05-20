import axiosInstance from "./axios";

export const productApi = {
    getAll: async () => {
        const { data } = await axiosInstance.get("/admin/products");
        return data;
    },

    create: async (formData) => {
        const { data } = await axiosInstance.post("/admin/products", formData);
        return data;
    },

    update: async ({ id, formData }) => {
        const { data } = await axiosInstance.put(`/admin/products/${id}`, formData);
        return data;
    },

    delete: async (productId) => {
        const { data } = await axiosInstance.delete(`/admin/products/${productId}`);
        return data;
    },
};

export const orderApi = {
    getAll: async () => {
        const { data } = await axiosInstance.get("/admin/orders");
        return data;
    },

    updateStatus: async ({ orderId, status }) => {
        const { data } = await axiosInstance.patch(`/admin/orders/${orderId}/status`, { status });
        return data;
    },
};

export const statsApi = {
    getDashboard: async () => {
        const { data } = await axiosInstance.get("/admin/stats");
        return data;
    },
};

export const activityApi = {
    getRecent: async () => {
        const { data } = await axiosInstance.get("/admin/activities");
        return data;
    },
};

export const customerApi = {
    getAll: async () => {
        const { data } = await axiosInstance.get("/admin/customers");
        return data;
    },
};

export const bannerApi = {
    get: async () => {
        const { data } = await axiosInstance.get("/banner");
        return data;
    },

    update: async (payload) => {
        const { data } = await axiosInstance.put("/admin/banner", payload);
        return data;
    },
};

export const shopApi = {
    getMyShop: async () => {
        const { data } = await axiosInstance.get("/shops/user/me");
        return data;
    },

    getMyShopStats: async () => {
        const { data } = await axiosInstance.get("/shops/user/me/stats");
        return data;
    },

    create: async (payload) => {
        const { data } = await axiosInstance.post("/shops", payload);
        return data;
    },

    update: async ({ id, payload }) => {
        const { data } = await axiosInstance.put(`/shops/${id}`, payload);
        return data;
    },

    getAll: async () => {
        const { data } = await axiosInstance.get("/shops");
        return data;
    },
};

export const userManagementApi = {
    getAllUsers: async () => {
        const { data } = await axiosInstance.get("/admin/users");
        return data;
    },

    banUser: async ({ userId, reason }) => {
        const { data } = await axiosInstance.patch(`/admin/users/${userId}/ban`, { reason });
        return data;
    },

    unbanUser: async (userId) => {
        const { data } = await axiosInstance.patch(`/admin/users/${userId}/unban`);
        return data;
    },
};