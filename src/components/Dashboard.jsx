import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Flame,
  IndianRupee,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import MetricCard from "./MetricCard";
import ClientCard from "./ClientCard";

export default function Dashboard({
  clients,
  onAddClientClick,
  onEditClient,
  onDeleteClient
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' | 'value' | 'name'
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' | 'desc'

  // 1. Calculate metrics dynamically
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const totalDealValue = clients.reduce((sum, c) => sum + (c.dealValue || 0), 0);

    // Payment Pending: Clients who have paid 40% but not 60%
    const pendingPayments = clients.filter(c => c.payment40Date && !c.payment60Date).length;

    // Deployed Projects: Clients with a deployment date
    const deployedProjects = clients.filter(c => !!c.deploymentDate).length;

    const formattedDealValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(totalDealValue);

    return {
      totalClients,
      totalDealValue: formattedDealValue,
      pendingPayments,
      deployedProjects
    };
  }, [clients]);

  // 2. Toggle sort direction
  const handleDirectionToggle = () => {
    setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
  };

  // 3. Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    // Filter
    let result = clients.filter(client => {
      const search = searchTerm.toLowerCase();
      return (
        client.name.toLowerCase().includes(search) ||
        client.description.toLowerCase().includes(search)
      );
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "value") {
        comparison = (a.dealValue || 0) - (b.dealValue || 0);
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        // Default: sort by date (fallback to createdAt if dealClosedDate missing)
        const dateA = a.dealClosedDate || a.createdAt || "";
        const dateB = b.dealClosedDate || b.createdAt || "";
        comparison = dateA.localeCompare(dateB);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [clients, searchTerm, sortBy, sortDirection]);

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Clients"
          value={metrics.totalClients}
          icon={Flame}
          type="clients"
        />
        <MetricCard
          title="Total Deal Value"
          value={metrics.totalDealValue}
          icon={IndianRupee}
          type="deal-value"
        />
        <MetricCard
          title="Payment Pending"
          value={metrics.pendingPayments}
          icon={Clock}
          type="pending"
        />
        <MetricCard
          title="Deployed Projects"
          value={metrics.deployedProjects}
          icon={CheckCircle2}
          type="deployed"
        />
      </div>

      {/* Search and Sort Filter Strip */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search clients by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-select-wrapper">
          <button
            className="direction-btn"
            onClick={handleDirectionToggle}
            title={`Sort Direction: ${sortDirection === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="value">Sort by Deal Value</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Clients Card List */}
      <div className="client-list">
        {filteredAndSortedClients.length > 0 ? (
          filteredAndSortedClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={onEditClient}
              onDelete={onDeleteClient}
            />
          ))
        ) : (
          <div style={{
            textAlign: "center",
            padding: "48px",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid var(--border-slate)",
            color: "var(--text-muted)"
          }}>
            No clients found matching the search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
