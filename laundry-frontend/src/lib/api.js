import { supabase } from "./supabaseClient";

export const api = {

  // =========================
  // AU TH
  // =========================

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      ok: true,
      user: data.user,
      session: data.session,
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { ok: true };
  },

  me: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return { user };
  },


  // =========================
  // CUSTOMERS
  // =========================

  listCustomers: async ({ pageSize = 50 } = {}) => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(pageSize);

    if (error) throw error;

    return {
      customers: data || [],
      total: data?.length || 0,
    };
  },

  createCustomer: async ({ fullName, phone, email }) => {

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("You must be logged in.");

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (adminError) throw adminError;
    if (!admin) throw new Error("Admin record not found.");

    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  updateCustomer: async (id, { fullName, phone, email }) => {

    const { data, error } = await supabase
      .from("customers")
      .update({
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  deleteCustomer: async (id) => {

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { ok: true };
  },


  // =========================
  // SERVICES
  // =========================

  listServices: async () => {

    const { data, error } = await supabase
      .from("service_types")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return {
      services: data || [],
    };
  },

  createService: async (data) => {

    const { data: service, error } = await supabase
      .from("service_types")
      .insert({
        name: data.name,
        price_per_kg: data.pricePerKg,
        is_active: data.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return service;
  },

  updateService: async (id, data) => {

    const { data: service, error } = await supabase
      .from("service_types")
      .update({
        name: data.name,
        price_per_kg: data.pricePerKg,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return service;
  },

  deleteService: async (id) => {

    const { error } = await supabase
      .from("service_types")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { ok: true };
  },


  // =========================
  // ORDERS
  // =========================

  listOrders: async ({
    q = "",
    status = "all",
    page = 0,
    pageSize = 8,
  } = {}) => {

    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        customers (
          full_name,
          phone,
          email
        ),
        service_types (
          name,
          price_per_kg
        )
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    let orders = data || [];

    if (q.trim()) {
      const search = q.toLowerCase();

      orders = orders.filter((order) => {
        return (
          order.tracking_id?.toLowerCase().includes(search) ||
          order.customers?.full_name?.toLowerCase().includes(search) ||
          order.customers?.phone?.toLowerCase().includes(search) ||
          order.customers?.email?.toLowerCase().includes(search)
        );
      });
    }

    orders = orders.map((order) => ({
      ...order,
      customer_name: order.customers?.full_name || "Unknown",
      service_name: order.service_types?.name || "Unknown",
    }));

    return {
      orders,
      total: count || 0,
    };
  },


  // =========================
  // GET SINGLE ORDER
  // =========================

 getOrder: async (id) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        full_name,
        phone,
        email
      ),
      service_types (
        name,
        price_per_kg
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  const { data: history, error: historyError } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("changed_at", { ascending: true });

  if (historyError) throw historyError;

  return {
    order: {
      ...data,
      customer_name: data.customers?.full_name || "Unknown",
      customer_phone: data.customers?.phone || "—",
      customer_email: data.customers?.email || "—",
      service_name: data.service_types?.name || "Unknown",
      status_history: history || [],
    },
  };
},

// =========================
// RESEND ORDER EMAIL
// =========================

resendOrderEmail: async (orderId) => {
  const { data, error } = await supabase.functions.invoke(
    "send-order-email",
    {
      body: {
        orderId,
      },
    }
  );

  if (error) throw error;

  if (!data?.success) {
    throw new Error(data?.error || "Failed to send order email.");
  }

  return data;
},

  // =========================
  // CREATE ORDER
  // =========================

  createOrder: async ({
    customerId,
    serviceTypeId,
    weightKg,
    price,
    estimatedFinish,
  }) => {

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("You must be logged in.");

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (adminError) throw adminError;
    if (!admin) throw new Error("Admin record not found.");

    const trackingId =
      "LND-" +
      Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        tracking_id: trackingId,
        customer_id: customerId,
        service_type_id: serviceTypeId,
        weight_kg: weightKg,
        price: price,
        status: "received",
        estimated_finish: estimatedFinish,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },


  // =========================
  // UPDATE ORDER STATUS
  // =========================

  setOrderStatus: async (id, status) => {
  // Update the order
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  // Add status history
  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: id,
      new_status: status,
    });

  if (historyError) throw historyError;

  return { id, status };
},


  // =========================
  // DASHBOARD
  // =========================

  dashboard: async () => {
  const { data, error } = await supabase
    .from("orders")
    //.select("id, tracking_id, status, price, created_at")//
    .select("id, tracking_id, status, price, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const orders = data || [];

  // Get today's date in Philippine time
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  // Convert a timestamp to YYYY-MM-DD in Philippine time
  function manilaDate(timestamp) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(timestamp));
  }

  // Completed orders today
    const completedTodayOrders = orders.filter(
      (order) =>
        order.status === "picked_up" &&
        manilaDate(order.created_at) === today
    );

    const completedToday = completedTodayOrders.length;

    const incomeToday = completedTodayOrders.reduce(
      (sum, order) => sum + Number(order.price || 0),
      0
    );

  // Last 7 days
  const trend = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

      const completed = orders.filter(
      (order) =>
        order.status === "picked_up" &&
        manilaDate(order.created_at) === dateKey
    ).length;

    trend.push({
      d: dateKey,
      c: completed,
    });
  }

  return {
    totalOrders: orders.length,

    pending: orders.filter(
      (order) => order.status !== "picked_up"
    ).length,

    completedToday,

    incomeToday,

    trend,

    recent: orders.slice(0, 5),
  };
},

  // =========================
  // REPORTS
  // =========================

  reports: async (range = "daily") => {
  const { data, error } = await supabase
    .from("orders")
    .select("status, price, created_at");

  if (error) throw error;

  const orders = data || [];

  // Convert a timestamp to Manila date
  function manilaDate(timestamp) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(timestamp));
  }

  // Only completed / picked-up orders count as completed sales
  const completedOrders = orders.filter(
    (order) => order.status === "picked_up"
  );

  const now = new Date();
  const result = [];

  if (range === "daily") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const dateKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

      const dayOrders = completedOrders.filter(
        (order) => manilaDate(order.created_at) === dateKey
      );

      result.push({
        bucket: dateKey,
        income: dayOrders.reduce(
          (sum, order) => sum + Number(order.price || 0),
          0
        ),
        order_count: dayOrders.length,
      });
    }
  }

  if (range === "weekly") {
    // Last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);

      const start = new Date(end);
      start.setDate(start.getDate() - 6);

      const startKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(start);

      const endKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(end);

      const weekOrders = completedOrders.filter((order) => {
        const d = manilaDate(order.created_at);
        return d >= startKey && d <= endKey;
      });

      result.push({
        bucket: `${startKey} – ${endKey}`,
        income: weekOrders.reduce(
          (sum, order) => sum + Number(order.price || 0),
          0
        ),
        order_count: weekOrders.length,
      });
    }
  }

  if (range === "monthly") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);

      const year = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Manila",
        year: "numeric",
      }).format(date);

      const month = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Manila",
        month: "2-digit",
      }).format(date);

      const monthKey = `${year}-${month}`;

      const monthOrders = completedOrders.filter(
        (order) => manilaDate(order.created_at).slice(0, 7) === monthKey
      );

      result.push({
        bucket: monthKey,
        income: monthOrders.reduce(
          (sum, order) => sum + Number(order.price || 0),
          0
        ),
        order_count: monthOrders.length,
      });
    }
  }

  return {
    data: result,
  };
},


  // =========================
  // PUBLIC TRACKING
  // =========================

track: async (trackingId) => {
  const { data, error } = await supabase
    .rpc("track_order", {
      p_tracking_id: trackingId,
    })
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error("Tracking ID not found.");
  }

  return {
    order: {
      trackingId: data.tracking_id,
      customerName: data.customer_name || "",
      serviceName: data.service_name || "",
      dateReceived: data.created_at,
      estimatedCompletion: data.estimated_finish,
      status: data.status,
      pickedUp: !!data.picked_up_at,
      weightKg: data.weight_kg,
      price: data.price,
    },
  };
},

};
