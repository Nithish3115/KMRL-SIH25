
export const trainData = {
  "trains": [
    {
      "id": "T001",
      "cars": [
        { "carId": "T001-C1", "status": "fit", "issue": null },
        { "carId": "T001-C2", "status": "fit", "issue": null },
        { "carId": "T001-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-A1",
      "status": "service-ready",
      "lastMaintenance": "2025-08-15",
      "telemetry": { "odometer": 45623, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2025-12-15" },
        { "type": "Maintenance", "valid": true, "expires": "2025-10-30" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-20" }
      ],
      "workOrders": [],
      "branding": { "contract": "Metro Bank", "hours": 2180, "target": 2400 }
    },
    {
      "id": "T002",
      "cars": [
        { "carId": "T002-C1", "status": "fit", "issue": null },
        { "carId": "T002-C2", "status": "minor-issue", "issue": "HVAC" },
        { "carId": "T002-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-A2",
      "status": "minor-wo",
      "lastMaintenance": "2025-07-20",
      "telemetry": { "odometer": 52341, "vibration": "Slightly elevated", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2025-11-20" },
        { "type": "Maintenance", "valid": true, "expires": "2025-09-07" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-15" }
      ],
      "workOrders": [
        { "id": "WO-234", "severity": "medium", "description": "HVAC filter replacement" }
      ],
      "branding": { "contract": "Metro Bank", "hours": 2180, "target": 2400 }
    },
    {
      "id": "T003",
      "cars": [
        { "carId": "T003-C1", "status": "blocked", "issue": "Brake" },
        { "carId": "T003-C2", "status": "fit", "issue": null },
        { "carId": "T003-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-B6",
      "status": "blocked",
      "lastMaintenance": "2025-06-10",
      "telemetry": { "odometer": 38952, "vibration": "High", "hvac": "Degraded" },
      "certificates": [
        { "type": "Safety", "valid": false, "expires": "2025-09-01" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-15" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-25" }
      ],
      "workOrders": [
        { "id": "WO-445", "severity": "critical", "description": "Brake system malfunction" },
        { "id": "WO-446", "severity": "high", "description": "Door sensor calibration" }
      ],
      "branding": { "contract": "TechCorp Solutions", "hours": 1520, "target": 1800 }
    },
    {
      "id": "T004",
      "cars": [
        { "carId": "T004-C1", "status": "fit", "issue": null },
        { "carId": "T004-C2", "status": "fit", "issue": null },
        { "carId": "T004-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-A3",
      "status": "service-ready",
      "lastMaintenance": "2025-08-25",
      "telemetry": { "odometer": 41267, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2025-12-30" },
        { "type": "Maintenance", "valid": true, "expires": "2025-10-20" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-15" }
      ],
      "workOrders": [],
      "branding": { "contract": "TechCorp Solutions", "hours": 1520, "target": 1800 }
    },
    {
      "id": "T005",
      "cars": [
        { "carId": "T005-C1", "status": "fit", "issue": null },
        { "carId": "T005-C2", "status": "fit", "issue": null },
        { "carId": "T005-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-A4",
      "status": "service-ready",
      "lastMaintenance": "2025-09-01",
      "telemetry": { "odometer": 23156, "vibration": "Excellent", "hvac": "Optimal" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-01-15" },
        { "type": "Maintenance", "valid": true, "expires": "2025-12-10" },
        { "type": "Inspection", "valid": true, "expires": "2025-11-05" }
      ],
      "workOrders": [],
      "branding": { "contract": "Kerala Tourism", "hours": 3100, "target": 3200 }
    },
    {
      "id": "T006",
      "cars": [
        { "carId": "T006-C1", "status": "fit", "issue": null },
        { "carId": "T006-C2", "status": "fit", "issue": null },
        { "carId": "T006-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-A5",
      "status": "service-ready",
      "lastMaintenance": "2025-08-18",
      "telemetry": { "odometer": 60345, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-01" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-10" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-01" }
      ],
      "workOrders": [],
      "branding": { "contract": "Kerala Tourism", "hours": 3100, "target": 3200 }
    },
    {
      "id": "T007",
      "cars": [
        { "carId": "T007-C1", "status": "fit", "issue": null },
        { "carId": "T007-C2", "status": "fit", "issue": null },
        { "carId": "T007-C3", "status": "minor-issue", "issue": "Door" }
      ],
      "location": "BAY-B1",
      "status": "minor-wo",
      "lastMaintenance": "2025-07-12",
      "telemetry": { "odometer": 75123, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2025-10-05" },
        { "type": "Maintenance", "valid": true, "expires": "2025-09-12" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-18" }
      ],
      "workOrders": [
        { "id": "WO-512", "severity": "low", "description": "Door sensor alignment" }
      ],
      "branding": { "contract": "City Mall", "hours": 980, "target": 1600 }
    },
    {
      "id": "T008",
      "cars": [
        { "carId": "T008-C1", "status": "fit", "issue": null },
        { "carId": "T008-C2", "status": "fit", "issue": null },
        { "carId": "T008-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C1",
      "status": "service-ready",
      "lastMaintenance": "2025-08-28",
      "telemetry": { "odometer": 33489, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-03-01" },
        { "type": "Maintenance", "valid": true, "expires": "2025-12-01" },
        { "type": "Inspection", "valid": true, "expires": "2025-11-01" }
      ],
      "workOrders": [],
      "branding": { "contract": "Green Energy Co", "hours": 1850, "target": 2000 }
    },
    {
      "id": "T009",
      "cars": [
        { "carId": "T009-C1", "status": "fit", "issue": null },
        { "carId": "T009-C2", "status": "fit", "issue": null },
        { "carId": "T009-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-B2",
      "status": "maintenance",
      "lastMaintenance": "2025-05-15",
      "telemetry": { "odometer": 98452, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2025-09-30" },
        { "type": "Maintenance", "valid": false, "expires": "2025-09-02" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-10" }
      ],
      "workOrders": [
        { "id": "WO-634", "severity": "high", "description": "Scheduled 6-month maintenance" }
      ],
      "branding": null
    },
    {
      "id": "T010",
      "cars": [
        { "carId": "T010-C1", "status": "fit", "issue": null },
        { "carId": "T010-C2", "status": "fit", "issue": null },
        { "carId": "T010-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C2",
      "status": "service-ready",
      "lastMaintenance": "2025-08-22",
      "telemetry": { "odometer": 41234, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-20" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-22" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-22" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T011",
      "cars": [
        { "carId": "T011-C1", "status": "fit", "issue": null },
        { "carId": "T011-C2", "status": "fit", "issue": null },
        { "carId": "T011-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C3",
      "status": "service-ready",
      "lastMaintenance": "2025-08-11",
      "telemetry": { "odometer": 56789, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-01-10" },
        { "type": "Maintenance", "valid": true, "expires": "2025-10-11" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-11" }
      ],
      "workOrders": [],
      "branding": { "contract": "Adani Group", "hours": 1200, "target": 2000 }
    },
    {
      "id": "T012",
      "cars": [
        { "carId": "T012-C1", "status": "fit", "issue": null },
        { "carId": "T012-C2", "status": "fit", "issue": null },
        { "carId": "T012-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C4",
      "status": "service-ready",
      "lastMaintenance": "2025-08-30",
      "telemetry": { "odometer": 29876, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-03-15" },
        { "type": "Maintenance", "valid": true, "expires": "2025-12-15" },
        { "type": "Inspection", "valid": true, "expires": "2025-11-15" }
      ],
      "workOrders": [],
      "branding": { "contract": "Adani Group", "hours": 1200, "target": 2000 }
    },
    {
      "id": "T013",
      "cars": [
        { "carId": "T013-C1", "status": "fit", "issue": null },
        { "carId": "T013-C2", "status": "fit", "issue": null },
        { "carId": "T013-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C5",
      "status": "service-ready",
      "lastMaintenance": "2025-08-14",
      "telemetry": { "odometer": 63456, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-14" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-14" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-14" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T014",
      "cars": [
        { "carId": "T014-C1", "status": "fit", "issue": null },
        { "carId": "T014-C2", "status": "fit", "issue": null },
        { "carId": "T014-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C6",
      "status": "service-ready",
      "lastMaintenance": "2025-08-01",
      "telemetry": { "odometer": 81234, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2025-12-01" },
        { "type": "Maintenance", "valid": true, "expires": "2025-10-01" },
        { "type": "Inspection", "valid": true, "expires": "2025-09-05" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T015",
      "cars": [
        { "carId": "T015-C1", "status": "fit", "issue": null },
        { "carId": "T015-C2", "status": "fit", "issue": null },
        { "carId": "T015-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C7",
      "status": "service-ready",
      "lastMaintenance": "2025-08-29",
      "telemetry": { "odometer": 35678, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-03-10" },
        { "type": "Maintenance", "valid": true, "expires": "2025-12-10" },
        { "type": "Inspection", "valid": true, "expires": "2025-11-10" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T016",
      "cars": [
        { "carId": "T016-C1", "status": "fit", "issue": null },
        { "carId": "T016-C2", "status": "fit", "issue": null },
        { "carId": "T016-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-C8",
      "status": "service-ready",
      "lastMaintenance": "2025-08-13",
      "telemetry": { "odometer": 69876, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-13" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-13" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-13" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T017",
      "cars": [
        { "carId": "T017-C1", "status": "fit", "issue": null },
        { "carId": "T017-C2", "status": "fit", "issue": null },
        { "carId": "T017-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D1",
      "status": "service-ready",
      "lastMaintenance": "2025-08-21",
      "telemetry": { "odometer": 43210, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-21" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-21" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-21" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T018",
      "cars": [
        { "carId": "T018-C1", "status": "fit", "issue": null },
        { "carId": "T018-C2", "status": "fit", "issue": null },
        { "carId": "T018-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D2",
      "status": "service-ready",
      "lastMaintenance": "2025-08-19",
      "telemetry": { "odometer": 59876, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-19" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-19" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-19" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T019",
      "cars": [
        { "carId": "T019-C1", "status": "fit", "issue": null },
        { "carId": "T019-C2", "status": "fit", "issue": null },
        { "carId": "T019-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D3",
      "status": "service-ready",
      "lastMaintenance": "2025-08-23",
      "telemetry": { "odometer": 48765, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-23" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-23" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-23" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T020",
      "cars": [
        { "carId": "T020-C1", "status": "fit", "issue": null },
        { "carId": "T020-C2", "status": "fit", "issue": null },
        { "carId": "T020-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D4",
      "status": "service-ready",
      "lastMaintenance": "2025-08-27",
      "telemetry": { "odometer": 37654, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-27" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-27" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-27" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T021",
      "cars": [
        { "carId": "T021-C1", "status": "fit", "issue": null },
        { "carId": "T021-C2", "status": "fit", "issue": null },
        { "carId": "T021-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D5",
      "status": "service-ready",
      "lastMaintenance": "2025-08-12",
      "telemetry": { "odometer": 71234, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-12" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-12" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-12" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T022",
      "cars": [
        { "carId": "T022-C1", "status": "fit", "issue": null },
        { "carId": "T022-C2", "status": "fit", "issue": null },
        { "carId": "T022-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D6",
      "status": "service-ready",
      "lastMaintenance": "2025-08-26",
      "telemetry": { "odometer": 39876, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-26" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-26" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-26" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T023",
      "cars": [
        { "carId": "T023-C1", "status": "fit", "issue": null },
        { "carId": "T023-C2", "status": "fit", "issue": null },
        { "carId": "T023-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D7",
      "status": "service-ready",
      "lastMaintenance": "2025-08-16",
      "telemetry": { "odometer": 65432, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-16" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-16" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-16" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T024",
      "cars": [
        { "carId": "T024-C1", "status": "fit", "issue": null },
        { "carId": "T024-C2", "status": "fit", "issue": null },
        { "carId": "T024-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-D8",
      "status": "service-ready",
      "lastMaintenance": "2025-08-20",
      "telemetry": { "odometer": 54321, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-20" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-20" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-20" }
      ],
      "workOrders": [],
      "branding": null
    },
    {
      "id": "T025",
      "cars": [
        { "carId": "T025-C1", "status": "fit", "issue": null },
        { "carId": "T025-C2", "status": "fit", "issue": null },
        { "carId": "T025-C3", "status": "fit", "issue": null }
      ],
      "location": "BAY-E1",
      "status": "service-ready",
      "lastMaintenance": "2025-08-24",
      "telemetry": { "odometer": 47654, "vibration": "Normal", "hvac": "Operational" },
      "certificates": [
        { "type": "Safety", "valid": true, "expires": "2026-02-24" },
        { "type": "Maintenance", "valid": true, "expires": "2025-11-24" },
        { "type": "Inspection", "valid": true, "expires": "2025-10-24" }
      ],
      "workOrders": [],
      "branding": null
    }
  ]
}
