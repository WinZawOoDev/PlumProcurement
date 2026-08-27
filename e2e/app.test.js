describe('PlumProcurement', () => {
  beforeAll(async () => { await device.launchApp() })
  beforeEach(async () => { await device.reloadReactNative() })
  it('should show Price Management and navigate tabs', async () => {
    await expect(element(by.text('Price Management'))).toBeVisible()
    await element(by.text('Purchasing')).tap()
    await expect(element(by.text('Record Purchase'))).toBeVisible()
    await element(by.text('Sellers')).tap()
    await expect(element(by.text('Sellers'))).toBeVisible()
  })
  it('should validate price form', async () => {
    await element(by.text('Prices')).tap()
    await element(by.text('Add New Price')).tap()
    await expect(element(by.text('Price Entry'))).toBeVisible()
    await element(by.text('Save Price')).tap()
    await expect(element(by.text('Price is required'))).toBeVisible()
  })
})
