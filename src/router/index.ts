import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import ProductTable from '../views/ProductTable.vue'
import AddProductForm from '../views/AddProductForm.vue'
import SalesTable from '../views/SalesTable.vue'
import PurchaseTable from '../views/PurchaseTable.vue'
import AddPurchaseForm from '../views/AddPurchaseForm.vue'
import ReportPage from '../views/ReportPage.vue'
import ProviderTable from '../views/ProviderTable.vue'
import UnitTable from '../views/UnitTable.vue'
import { authGuard } from './authGuard'


const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Dashboard', component: Dashboard,  meta: { requiresAuth: true } },
  { path: '/add-product', name: 'AddProduct', component: AddProductForm,  meta: { requiresAuth: true } },
  { path: '/products', name: 'ProductTable', component: ProductTable,  meta: { requiresAuth: true } },
  { path: '/providers', name: 'ProviderTable', component: ProviderTable,  meta: { requiresAuth: true } },
  { path: '/units', name: 'UnitTable', component: UnitTable,  meta: { requiresAuth: true } },
  { path: '/sales', name: 'SalesTable', component: SalesTable,  meta: { requiresAuth: true } },
  { path: '/purchases', name: 'PurchaseTable', component: PurchaseTable, meta: { requiresAuth: true } },
  { path: '/purchases/new', name: 'AddPurchase', component: AddPurchaseForm, meta: { requiresAuth: true } },
  { path: '/reports', name: 'ReportPage', component: ReportPage,  meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(authGuard)

export default router
