import React, { useEffect, useState } from "react";
import { getStats } from "../../service/stats";
import { Stats } from "../../interface/stats";
import { Card, Col, Row, Statistic, Spin } from "antd";
import { DollarOutlined, ShoppingCartOutlined, ProductOutlined } from "@ant-design/icons";

const Thongke = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        console.log("Frontend Stats:", data); // Debug log
        setStats(data);
      } catch (err) {
        setError("Failed to load statistics.");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Thống kê tổng quan</h1>
      
      {/* Product Statistics */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats?.products.totalProducts}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm hoạt động"
              value={stats?.products.activeProducts}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng biến thể"
              value={stats?.products.totalVariants}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng kho"
              value={stats?.products.totalStock}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats?.orders.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng đang chờ"
              value={stats?.orders.pendingOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng đang đóng gói"
              value={stats?.orders.packagingOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hoàn thành"
              value={stats?.orders.completedOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng đã hủy"
              value={stats?.orders.canceledOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats?.revenue.totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Giá trị đơn hàng trung bình"
              value={stats?.revenue.averageOrderValue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Thongke;