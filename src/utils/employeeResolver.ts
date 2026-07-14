import { Employee, User } from '../types';

export function getEmployeeNameById(employees: Employee[], employeeId: string): string {
  const emp = employees.find(e => e.id === employeeId);
  return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
}

export function getEmployeeById(employees: Employee[], employeeId: string): Employee | undefined {
  return employees.find(e => e.id === employeeId);
}

export function getEmployeeByUserId(employees: Employee[], userId: string): Employee | undefined {
  return employees.find(e => e.userId === userId);
}

export function getUserNameById(users: User[], userId: string): string {
  const user = users.find(u => u.id === userId);
  return user ? user.name : 'Unknown';
}

export function getUserById(users: User[], userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function getEmployeesByCompany(employees: Employee[], companyId: string): Employee[] {
  return employees.filter(e => e.companyId === companyId && e.status === 'Active');
}

export function getActiveEmployees(employees: Employee[], companyId: string): Employee[] {
  return employees.filter(e => e.companyId === companyId && e.status === 'Active');
}
