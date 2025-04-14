#include <bits/stdc++.h>
using namespace std;
typedef long long int ll;

inline ll returnSum(vector<ll> v,ll n){
    if (n==1) return v[0];
    ll sum=INT_MIN;
    while (n>2){
        ll x=0;
        vector<ll> temp;
        for (int i=1;i<v.size();i++){
            temp.push_back(v[i]-v[i-1]);    
            x+=temp.back();
        }
        sum=max(sum,x);
        v=temp;
        n--;
    }
    if (n==2) sum=max(sum,max(v[1]-v[0],v[0]-v[1]));
    sum=max(sum,v[0]+v[1]);
    return sum;
}

int main(){
    int tc;
    cin >> tc;
    while (tc--){
        int n;
        cin >> n;
        vector<ll> v(n);
        ll sum=0;
        for (int i = 0; i < n; i++){
            cin >> v[i];
            sum+=v[i];
        }
        ll ax = returnSum(v,n);
        cout << max(ax,sum) << endl;
    }
}