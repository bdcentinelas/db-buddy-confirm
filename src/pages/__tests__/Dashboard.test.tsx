import { groupVotersByHour } from '@/lib/dashboardUtils';

describe('groupVotersByHour', () => {
  it('should return empty array when no voters are provided', () => {
    const result = groupVotersByHour([]);
    expect(result).toEqual([]);
  });

  it('should group voters by hour correctly', () => {
    const mockVoters = [
      { created_at: '2024-01-15T10:30:00Z' },
      { created_at: '2024-01-15T10:45:00Z' },
      { created_at: '2024-01-15T11:15:00Z' },
      { created_at: '2024-01-15T11:30:00Z' },
      { created_at: '2024-01-15T11:45:00Z' },
    ];

    const result = groupVotersByHour(mockVoters);

    // Should have 24 hours of data
    expect(result).toHaveLength(24);
    
    // Check that hours are in correct format
    result.forEach(hourData => {
      expect(hourData.hour).toMatch(/^\d{2}:\d{2}$/);
      expect(typeof hourData.count).toBe('number');
      expect(hourData.count).toBeGreaterThanOrEqual(0);
    });

    // Check specific hour counts
    const hour10 = result.find(h => h.hour === '10:00');
    const hour11 = result.find(h => h.hour === '11:00');
    
    expect(hour10?.count).toBe(2);
    expect(hour11?.count).toBe(3);
  });

  it('should handle voters from different days', () => {
    const mockVoters = [
      { created_at: '2024-01-15T23:30:00Z' }, // 23:00
      { created_at: '2024-01-16T00:15:00Z' }, // 00:00 (next day)
      { created_at: '2024-01-16T01:45:00Z' }, // 01:00 (next day)
    ];

    const result = groupVotersByHour(mockVoters);

    expect(result).toHaveLength(24);
    
    const hour23 = result.find(h => h.hour === '23:00');
    const hour00 = result.find(h => h.hour === '00:00');
    const hour01 = result.find(h => h.hour === '01:00');
    
    expect(hour23?.count).toBe(1);
    expect(hour00?.count).toBe(1);
    expect(hour01?.count).toBe(1);
  });

  it('should handle edge cases with invalid dates', () => {
    const mockVoters = [
      { created_at: 'invalid-date' },
      { created_at: '2024-01-15T12:30:00Z' },
      { created_at: '' },
    ];

    // Should not throw error and should handle gracefully
    const result = groupVotersByHour(mockVoters);
    
    expect(result).toHaveLength(24);
    
    // Should still count the valid date
    const hour12 = result.find(h => h.hour === '12:00');
    expect(hour12?.count).toBe(1);
  });

  it('should return 0 for hours with no voters', () => {
    const mockVoters = [
      { created_at: '2024-01-15T14:30:00Z' },
    ];

    const result = groupVotersByHour(mockVoters);

    // Most hours should have 0 count
    const zeroCountHours = result.filter(h => h.count === 0);
    expect(zeroCountHours.length).toBeGreaterThan(20);
    
    // The hour with voter should have count 1
    const hour14 = result.find(h => h.hour === '14:00');
    expect(hour14?.count).toBe(1);
  });

  it('should generate data for the last 24 hours', () => {
    const mockVoters = [
      { created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
      { created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }, // 12 hours ago
    ];

    const result = groupVotersByHour(mockVoters);

    expect(result).toHaveLength(24);
    
    // Should include current hour and previous 23 hours
    const currentHour = new Date().getHours().toString().padStart(2, '0') + ':00';
    const currentHourData = result.find(h => h.hour === currentHour);
    expect(currentHourData?.count).toBe(0);
  });
});